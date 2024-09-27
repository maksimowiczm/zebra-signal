use axum::extract::ws::WebSocket;
use futures::StreamExt;
use rand::distributions::Alphanumeric;
use rand::Rng;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::time::sleep;

const SESSION_TIMEOUT: u64 = 30;
const SOCKET_TIMEOUT: u64 = 60;

#[derive(Clone)]
pub struct ZebraContainer {
    connections: Arc<Mutex<HashMap<String, Option<WebSocket>>>>,
}

pub enum ConnectionError {
    SessionNotFound,
}

impl ZebraContainer {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn create_session(&self) -> String {
        let mut connections = self
            .connections
            .lock()
            .expect("No other locks should panic");

        let mut token = rand::thread_rng()
            .sample_iter(&Alphanumeric)
            .take(8)
            .map(char::from)
            .collect::<String>();

        // Ensure token is unique
        while connections.contains_key(&token) {
            token = rand::thread_rng()
                .sample_iter(&Alphanumeric)
                .take(8)
                .map(char::from)
                .collect::<String>();
        }

        connections.insert(token.clone(), None);

        tracing::debug!("Created session with token: {}", token);

        // Remove session after timeout
        {
            let connections = self.connections.clone();
            let token = token.clone();
            tokio::spawn(async move {
                sleep(std::time::Duration::from_secs(SESSION_TIMEOUT)).await;

                // todo this might cause issues if connection was established and removed but another connection with same token was created
                if connections
                    .lock()
                    .expect("No other locks should panic")
                    .remove(&token)
                    .is_some()
                {
                    tracing::debug!("Removed session with token: {}", token);
                } else {
                    tracing::debug!("Session with token: {} already removed", token);
                }
            });
        }

        token
    }

    pub fn handle_connection(
        &self,
        token: String,
        socket: WebSocket,
    ) -> Result<(), ConnectionError> {
        let mut connections = self
            .connections
            .lock()
            .expect("No other locks should panic");

        let entry = connections
            .get(&token)
            .ok_or(ConnectionError::SessionNotFound)?;

        // If it is first connection with this token await for second connection
        if entry.is_none() {
            tracing::debug!("Waiting for second connection");
            connections.insert(token.clone(), Some(socket));
            return Ok(());
        }

        tracing::debug!("Relaying sockets");
        let first = connections.remove(&token).unwrap().unwrap();
        setup_relay(first, socket);

        Ok(())
    }
}

fn setup_relay(first: WebSocket, second: WebSocket) {
    let (first_tx, first_rx) = first.split();
    let (second_tx, second_rx) = second.split();

    let relay_first = first_rx.forward(second_tx);
    let relay_second = second_rx.forward(first_tx);

    let timeout = tokio::spawn(async {
        sleep(std::time::Duration::from_secs(SOCKET_TIMEOUT)).await;
    });

    tokio::spawn(async {
        tokio::select! {
            _ = relay_first => {
                tracing::debug!("Socket closed");
            }
            _ = relay_second => {
                tracing::debug!("Socket closed");
            }
            _ = timeout => {
                tracing::debug!("Timeout reached");
            }
        }

        tracing::debug!("Relay closed");
    });
}
