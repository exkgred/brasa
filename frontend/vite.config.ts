import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@game': path.resolve(__dirname, '../backend/src/domain/game'),
    },
  },
  server: {
    port: 5177,
    proxy: {
      '/api': { target: 'http://localhost:3006', changeOrigin: true },
    },
  },
})
