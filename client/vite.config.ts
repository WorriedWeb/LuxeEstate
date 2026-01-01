import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: true,

    // 🔥 Proxy frontend /api → backend :5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
});
