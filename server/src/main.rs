mod generator;
mod zebra_session_manager;

use crate::generator::linear_congruential_generator::NotRepeatableLinearCongruentialGenerator;
use crate::generator::Generator;
use crate::zebra_session_manager::{ConnectionError, ZebraSessionManager};
use axum::extract::ws::WebSocket;
use axum::extract::{Query, State, WebSocketUpgrade};
use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::{serve, Json, Router};
use clap::Parser;
use serde::Deserialize;
use std::net::ToSocketAddrs;
use tokio::net::TcpListener;
use tower_http::trace::{DefaultMakeSpan, TraceLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;

#[derive(Parser, Debug)]
struct Args {
    #[arg(long, default_value = "60")]
    session_timeout: u64,

    #[arg(long, default_value = "30")]
    socket_timeout: u64,

    #[arg(long, default_value = "0.0.0.0:8080")]
    address: String,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    tracing_subscriber::registry()
        .with(tracing_subscriber::fmt::layer())
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or("zebra_signal=debug,tower_http=info".into()),
        )
        .init();

    let app = Router::new()
        .route("/session", get(session))
        .route("/ws", get(socket))
        .route("/ping", get(|| async { "pong" }))
        .with_state(ZebraSessionManager::new(
            args.session_timeout,
            args.socket_timeout,
            NotRepeatableLinearCongruentialGenerator::new_random(),
        ))
        .layer(
            TraceLayer::new_for_http()
                .make_span_with(DefaultMakeSpan::default().include_headers(true)),
        );

    let address = args
        .address
        .to_socket_addrs()
        .expect("Should parse address successfully")
        .next()
        .unwrap();

    let listener = TcpListener::bind(address)
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

async fn session<G: Generator>(mut app_state: State<ZebraSessionManager<G>>) -> Response {
    match app_state.create_session() {
        Ok(session) => (StatusCode::OK, Json(session)).into_response(),
        Err(_) => (
            StatusCode::SERVICE_UNAVAILABLE,
            "Service Unavailable - Try again later",
        )
            .into_response(),
    }
}

#[derive(Deserialize)]
struct SessionQuery {
    token: String,
}

async fn socket<G: Generator + Send + 'static>(
    ws: WebSocketUpgrade,
    Query(session): Query<SessionQuery>,
    app_state: State<ZebraSessionManager<G>>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(session.token, socket, app_state))
}

async fn handle_socket<G: Generator>(
    token: String,
    socket: WebSocket,
    app_state: State<ZebraSessionManager<G>>,
) {
    let token = match token.parse::<u32>() {
        Ok(token) => token,
        Err(_) => {
            tracing::debug!("Invalid token");
            return;
        }
    };

    match app_state.handle_connection(token, socket) {
        Ok(_) => {}
        Err(ConnectionError::SessionNotFound) => tracing::debug!("Session not found"),
    }
}
