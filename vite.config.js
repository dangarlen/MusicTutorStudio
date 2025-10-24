import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  root: "public/vue/refactor-alpha",
  plugins: [vue()],
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": "/public/vue/refactor-alpha",
    },
  },
  server: {
    port: 5173,
  },
});
