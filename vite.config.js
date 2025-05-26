// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: './', // ensure relative asset paths
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: 'all',
    hmr: false  // disable HMR temporarily
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
