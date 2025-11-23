import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  root: '.', // repo root
  plugins: [vue()],
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: true,          // helpful for debugging
  },
  base: '/',                  // ensures assets resolve correctly on Netlify
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),   // canonical source alias
    },
  },
  server: {
    port: 5173,
    open: true,                // auto-open browser on dev start
    strictPort: true,          // fail if port is taken, avoids silent fallback
  },
})
