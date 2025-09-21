import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.eklesia.app.br',
        changeOrigin: true,
        secure: true,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Erro de proxy:', err);
          });
          proxy.on('proxyReq', (_unused, req) => {
            console.log('Enviando solicitação para:', req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Recebeu resposta para:', req.url, 'status:', proxyRes.statusCode);
          });
        }
      }
    }
  }
});
