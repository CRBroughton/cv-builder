import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4200,
    host: "localhost",
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  preview: {
    port: 4300,
    host: "localhost",
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
  },
});
