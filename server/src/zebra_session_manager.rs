use crate::generator::Generator;
use axum::extract::ws::WebSocket;
use futures::StreamExt;
use serde::Serialize;
use std::collections::HashMap;
use std::hash::{Hash, Hasher};
use std::sync::{Arc, Mutex};
use tokio::sync::oneshot;

pub struct Connection {
    socket: Option<WebSocket>,
    cancel_tx: oneshot::Sender<()>,
}

#[derive(Clone)]
pub struct ZebraSessionManager<G> {
    sequence: Arc<Mutex<G>>,
    connections: Arc<Mutex<HashMap<u32, Connection>>>,
    session_timeout: u64,
    socket_timeout: u64,
}

impl<G> ZebraSessionManager<G> {
    pub fn new(session_timeout: u64, socket_timeout: u64, sequence: G) -> Self {
        Self {
            sequence: Arc::new(Mutex::new(sequence)),
            connections: Arc::new(Mutex::new(HashMap::new())),
            session_timeout,
            socket_timeout,
        }
    }
}

pub enum ConnectionError {
    SessionNotFound,
}

#[derive(Serialize)]
pub struct Session {
    // using u32 because JS supports only f64, which makes integer max value 2^53
    token: u32,
    expires: u32,
}

pub enum CreateSessionError {
    SessionLimitReached,
    SequenceError,
}

impl<G> ZebraSessionManager<G>
where
    G: Generator,
{
    fn get_next_token(generator: &mut G) -> Result<u32, CreateSessionError> {
        let mut hasher = std::hash::DefaultHasher::new();

        let next = generator.next().ok_or_else(|| {
            tracing::error!("Sequence failed to generate next value");
            CreateSessionError::SequenceError
        })?;

        next.hash(&mut hasher);

        // make sure the hash is 32 bits
        Ok((hasher.finish() & 0xFFFFFFFF) as u32)
    }

    pub fn create_session(&mut self) -> Result<Session, CreateSessionError> {
        let mut connections = self
            .connections
            .lock()
            .expect("No other locks should panic");

        let mut sequence = self.sequence.lock().expect("No other locks should panic");

        let mut token = Self::get_next_token(&mut sequence)?;

        let mut tries = 0;
        // this is a very unlikely event, but just in case
        while connections.contains_key(&token) {
            if tries > 10 {
                return Err(CreateSessionError::SessionLimitReached);
            }
            tries += 1;

            token = Self::get_next_token(&mut sequence)?;
        }

        let (cancel_tx, cancel) = oneshot::channel();

        connections.insert(
            token,
            Connection {
                socket: None,
                cancel_tx,
            },
        );

        tracing::debug!("Created session with token: {}", token);

        // Remove session after timeout
        {
            let connections = self.connections.clone();
            let timeout = self.session_timeout;
            tokio::spawn(async move {
                tokio::select! {
                    _ = cancel => {
                        tracing::debug!("Session with token: {} pop canceled", token);
                        return;
                    }
                    _ = tokio::time::sleep(std::time::Duration::from_secs(timeout)) => {
                        tracing::debug!("Session with token: {} timed out", token);
                    }
                }

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

        let expire_times =
            chrono::Utc::now() + std::time::Duration::from_secs(self.session_timeout);

        let expires = expire_times
            .timestamp()
            .try_into()
            .expect("Time shouldn't go backwards");

        Ok(Session { token, expires })
    }

    pub fn handle_connection(&self, token: u32, socket: WebSocket) -> Result<(), ConnectionError> {
        let mut connections = self
            .connections
            .lock()
            .expect("No other locks should panic");

        let entry = connections
            .get_mut(&token)
            .ok_or(ConnectionError::SessionNotFound)?;

        // If it is first connection with this token await for second connection
        if entry.socket.is_none() {
            tracing::debug!("Waiting for second connection");
            entry.socket = Some(socket);
            return Ok(());
        }

        tracing::debug!("Relaying sockets");
        let connection = connections.remove(&token).unwrap();
        let _ = connection.cancel_tx.send(());
        setup_relay(connection.socket.unwrap(), socket, self.socket_timeout);

        Ok(())
    }
}

fn setup_relay(first: WebSocket, second: WebSocket, timeout: u64) {
    let (first_tx, first_rx) = first.split();
    let (second_tx, second_rx) = second.split();

    let relay_first = first_rx.forward(second_tx);
    let relay_second = second_rx.forward(first_tx);

    let timeout = tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_secs(timeout)).await;
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
