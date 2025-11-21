import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    host_permissions: ['https://*/*', 'http://*/*'],
    web_accessible_resources: [
      {
        resources: ['main-world.js'],
        matches: ['*://*/*'],
      },
    ],
  },
  vite: () => ({
    plugins: [react(), tailwindcss()],
  }),
});
