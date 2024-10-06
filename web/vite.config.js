export default {
  server: {
    host: "0.0.0.0", // otherwise webrtc won't work
    port: 3000,
    // proxy zebra-signal
    proxy: {
      "/session": "http://localhost:8080",
      "/ws": {
        target: "http://localhost:8080",
        ws: true,
      },
    },
  },
};
