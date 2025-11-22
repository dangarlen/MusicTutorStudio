import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  root: "vue-src-alpha",
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, "public/alpha-vue-SPA"),
    emptyOutDir: true,
  },
  base: "/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "vue-src-alpha"),
    },
  },
  server: {
    port: 5173,
  },
});
