import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: 3001,
  },

  build: {
    // Keep individual chunks reasonably sized
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — rarely changes, excellent cache hit
          'vendor-react':  ['react', 'react-dom'],
          // Router — split from react so updates don't bust the react chunk
          'vendor-router': ['react-router-dom'],
          // Data-fetching — large library, own chunk
          'vendor-query':  ['@tanstack/react-query'],
          // HTTP client
          'vendor-axios':  ['axios'],
        },
      },
    },
  },
})
