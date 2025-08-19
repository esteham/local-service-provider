import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Copy .htaccess to build directory
    copyPublicDir: true
  },
  publicDir: 'public',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/backend/api')
      },
      '/backend': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
