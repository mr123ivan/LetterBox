import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // This proxies requests starting with /api to your Node.js server
    proxy: {
      '/api': {
        target: 'http://backend:5001', // <-- Your Express server URL
        changeOrigin: true,
        secure: false,
      },
    },
  }
});