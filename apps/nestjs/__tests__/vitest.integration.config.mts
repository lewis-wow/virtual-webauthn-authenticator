import { createIntegrationConfig } from '@repo/vitest-config/integration-factory';
import swc from 'unplugin-swc';
import { Plugin } from 'vitest/config';

import pkg from '../package.json';

export default createIntegrationConfig({
  dirname: import.meta.dirname,
  name: pkg.name,
  additionalConfig: {
    plugins: [swc.vite() as Plugin],
  },
});
