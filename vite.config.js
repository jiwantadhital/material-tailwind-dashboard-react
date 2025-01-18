import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://10.3.4.221:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
