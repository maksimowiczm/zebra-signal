import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
});
