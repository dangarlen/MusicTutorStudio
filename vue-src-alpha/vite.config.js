import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, "../public/alpha-vue-SPA"), // Output to public/alpha-vue-SPA
  },
  // For Netlify root deployment we want the SPA to be served at site root.
  // Set base to "/" so built assets reference the root paths when published
  // to Netlify. When deploying to a subfolder, change this back to "/alpha-vue-SPA/".
  base: "/",
  root: ".", // Use current directory as root
  publicDir: resolve(__dirname, "../public"), // Ensure static assets from ../public are available
});
