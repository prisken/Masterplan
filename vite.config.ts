import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/** When using `vite` alone, proxy /api to `vercel dev` (e.g. http://127.0.0.1:3000). */
const apiProxy = process.env.API_PROXY_TARGET;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: apiProxy
    ? {
        proxy: {
          '/api': {
            target: apiProxy,
            changeOrigin: true,
          },
        },
      }
    : undefined,
});
