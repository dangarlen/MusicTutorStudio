import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: "public/alpha-vue",
  plugins: [vue()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": "/public/alpha-vue",
    },
  },
  server: {
    port: 5173,
  },
});
