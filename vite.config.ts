import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // Comma-separated hostnames, set on the Pi's systemd unit so the tailnet
    // name stays out of this public repo. preview.allowedHosts inherits this.
    allowedHosts: process.env.ALLOWED_HOSTS?.split(","),
    hmr: {
      overlay: false,
    },
    // preview.proxy inherits this. 127.0.0.1, since the API listens on IPv4
    // only and localhost can resolve to ::1.
    proxy: {
      "/api": "http://127.0.0.1:3001",
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));
