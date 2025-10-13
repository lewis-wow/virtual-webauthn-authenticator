import { defineManifest } from '@crxjs/vite-plugin';

import pkg from './package.json';

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  content_scripts: [
    {
      js: ['src/content/injector.ts'],
      matches: ['<all_urls>'],
      run_at: 'document_start',
    },
  ],
  web_accessible_resources: [
    {
      resources: ['src/content/override.js'],
      matches: ['<all_urls>'],
    },
  ],
});
