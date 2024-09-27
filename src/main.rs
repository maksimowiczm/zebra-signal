mod zebra_container;

use crate::zebra_container::{ConnectionError, ZebraContainer};
use axum::extract::ws::WebSocket;
use axum::extract::{Query, State, WebSocketUpgrade};
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{serve, Router};
use serde::Deserialize;
use tokio::net::TcpListener;
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,tower_http=debug", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .init();

    let app = Router::new()
        .route("/", get(session))
        .route("/ws", get(socket))
        .with_state(ZebraContainer::new())
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let addr = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "0.0.0.0:3000".to_string());

    let listener = TcpListener::bind(addr)
        .await
        .expect("Should bind to address successfully");

    tracing::debug!("listening on {}", listener.local_addr().unwrap());

    serve(listener, app)
        .await
        .expect("Should serve the app successfully");
}

#[allow(dead_code)]
#[derive(Clone)]
struct Session {
    token: String,
}

async fn session(app_state: State<ZebraContainer>) -> impl IntoResponse {
    app_state.create_session()
}

#[derive(Deserialize)]
struct SessionQuery {
    token: String,
}

async fn socket(
    ws: WebSocketUpgrade,
    Query(session): Query<SessionQuery>,
    app_state: State<ZebraContainer>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(session.token, socket, app_state))
}

async fn handle_socket(token: String, socket: WebSocket, app_state: State<ZebraContainer>) {
    match app_state.handle_connection(token, socket) {
        Ok(_) => {}
        Err(ConnectionError::SessionNotFound) => tracing::debug!("Session not found"),
    }
}
