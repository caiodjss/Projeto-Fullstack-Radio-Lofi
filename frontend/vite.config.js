import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'lofi-frontend-production.up.railway.app',
      '.up.railway.app', // Libera qualquer subdomínio do Railway
      'localhost',
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'lofi-frontend-production.up.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
});