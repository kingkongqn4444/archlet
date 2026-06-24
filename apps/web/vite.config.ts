import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-xyflow": ["@xyflow/react"],
          "vendor-tanstack": ["@tanstack/react-query"],
          "vendor-export": ["html-to-image", "jspdf"],
        },
      },
    },
  },
});
