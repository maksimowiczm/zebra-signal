### What is Zebra Signal

Zebra Signal is a simple web application that allows users to send and receive messages in real-time.  
Messages are encoded with Protocol Buffers (protobuf) and sent over a WebRTC data channel.

The available message formats are defined in the [zebra proto repository](https://github.com/maksimowiczm/zebra-proto).

### Potential risks

- web client peer connection lacks of authentication, it does not perform any handshake. In other words, anyone can
  connect to your peer connection and send messages.

### Usage

```bash
git clone https://github.com/maksimowiczm/zebra-signal
cd zebra-signal
docker compose up
```

Visit [http://localhost](http://localhost) in your browser.

### API

[API Documentation](./server/README.md)

### What can it be used for

- [zebra android app](https://github.com/maksimowiczm/zebra-android) with feature share enabled.
