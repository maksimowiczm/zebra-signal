import path from "path";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@material-icons": `${path.resolve(__dirname, "src/assets/material_icons/index.ts")}`,
    },
  },
  server: {
    open: true, // otherwise webrtc won't work
    // proxy zebra-signal
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        ws: true,
      },
    },
  },
});
