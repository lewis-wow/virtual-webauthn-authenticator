import { crx } from '@crxjs/vite-plugin';
import path from 'node:path';
import { defineConfig } from 'vite';
import zip from 'vite-plugin-zip-pack';

import manifest from './manifest.config.js';

export default defineConfig({
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
  plugins: [
    crx({ manifest }),
    zip({ outDir: 'release', outFileName: 'release.zip' }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
