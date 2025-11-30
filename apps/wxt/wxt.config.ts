import tailwindcss from '@tailwindcss/vite';
import archiver from 'archiver';
// @ts-expect-error - crx do not have .d.ts type definition file
import ChromeExtension from 'crx';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'wxt';

// openssl genrsa -out key.pem 2048

// See https://wxt.dev/api/config.html
export default defineConfig({
  dev: {
    server: {
      port: 6666,
    },
  },
  modules: ['@wxt-dev/module-react'],
  manifest: {
    action: {
      default_popup: 'popup.html',
    },
    permissions: ['storage'],
    host_permissions: ['https://*/*', 'http://*/*'],
    web_accessible_resources: [
      {
        resources: ['main-world.js'],
        matches: ['*://*/*'],
      },
    ],
  },
  hooks: {
    'build:done': async (wxt) => {
      // 1. Define paths
      // WXT output is usually .output/chrome-mv3 by default
      const distDir = path.resolve('.output/chrome-mv3');
      const distFolder = path.resolve('dist');
      const keyPath = path.resolve('key.pem');
      const appName = process.env.WXT_APP_NAME || 'extension';

      const crxPath = path.join(distFolder, `${appName}.crx`);
      const zipPath = path.join(distFolder, `${appName}.zip`);

      console.log('📦 Starting post-build packaging...');

      // Ensure dist directory exists
      if (!fs.existsSync(distFolder)) {
        fs.mkdirSync(distFolder, { recursive: true });
      }

      // --- 2. ZIP Generation ---
      // We do this in parallel or before CRX to ensure we have both formats
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = fs.createWriteStream(zipPath);

      await new Promise<void>((resolve, reject) => {
        archive
          .directory(distDir, false)
          .on('error', (err) => reject(err))
          .pipe(stream);

        stream.on('close', () => {
          console.log(`✅ ZIP created successfully at: ${zipPath}`);
          resolve();
        });

        archive.finalize();
      });

      // --- 3. CRX Generation ---
      // Check for Private Key
      if (!fs.existsSync(keyPath)) {
        console.warn('⚠️  Skipping CRX pack: "key.pem" not found in root.');
        return;
      }

      try {
        const crx = new ChromeExtension({
          privateKey: fs.readFileSync(keyPath),
        });

        await crx.load(distDir);
        const crxBuffer = await crx.pack();

        fs.writeFileSync(crxPath, crxBuffer);
        console.log(`✅ CRX created successfully at: ${crxPath}`);
      } catch (err) {
        console.error('❌ Failed to pack CRX:', err);
      }
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
      dedupe: ['react', 'react-dom'],
    },
  }),
});
