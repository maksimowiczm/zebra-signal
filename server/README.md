## Zebra signal server

Zebra signal server is a simple websocket relay server that allows users to send and receive messages in real-time.

## API Documentation

`GET /ping`

- **Description**: Check if the server is running.
- **Response**:
    - `200 OK`: Returns "pong"

---

`GET /session`

- **Description**: Create a session and return an authentication token.
- **Response**:
    - `200 OK`: Returns token and expiration time
  ```json
  {
    "token": "GBCRuUvv",
    "expires": 1728504338
  }

---

`ws /socket`

- **Description**: Establish a WebSocket connection for real-time communication. Connection will be closed after the
  socket timeout.
- **Connection**:
    - Requires an active token in the initial request (e.g., `/socket?token=GBCRuUvv`).
- **Close**: The server will close the connection if the token is invalid or expired.

---

