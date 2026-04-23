import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Tente usar true em vez de 'all'
    allowedHosts: true, 
    proxy: {
      '/n8n-webhook': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-webhook/, '')
      }
    }
  },
  preview: {
    // Ou coloque o domínio específico dentro de colchetes []
    allowedHosts: ['automacao-bia-crm.dczbc9.easypanel.host']
  }
})
