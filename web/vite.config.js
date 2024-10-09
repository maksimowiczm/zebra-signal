export default {
  server: {
    open: true, // otherwise webrtc won't work
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
