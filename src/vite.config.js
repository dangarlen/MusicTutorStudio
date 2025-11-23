import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, "../dist"), // Output to dist/
    emptyOutDir: true,
  },
  base: "/",
  root: ".",
  publicDir: resolve(__dirname, "../public"),
});
