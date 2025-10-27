import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, "../public/alpha-vue-SPA"), // Output to public/alpha-vue-SPA
  },
  base: "/alpha-vue-SPA/", // Use absolute base for deployment subfolder
  root: ".", // Use current directory as root
});
