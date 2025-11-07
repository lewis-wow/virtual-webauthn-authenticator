import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig, Plugin } from 'vitest/config';

import pkg from '../package.json';

const env = config({
  path: join(import.meta.dirname, '..', '.env.test'),
  overload: true,
}).parsed;

export default defineConfig({
  test: {
    name: pkg.name,
    env,
    coverage: {
      provider: 'v8',
    },
    fileParallelism: false,
  },
  plugins: [swc.vite() as Plugin],
});
