import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.0.177',
      'boxing-blog-bunny.ngrok-free.dev' // ← Reemplaza con tu nueva URL de ngrok
    ],
    port: 5173
  }
})
