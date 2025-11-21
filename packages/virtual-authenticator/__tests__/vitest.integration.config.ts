import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

const env = config({
  path: join(import.meta.dirname, '..', '.env.test'),
  override: true,
}).parsed;

const projectRoot = join(import.meta.dirname, '..');

export default defineConfig({
  test: {
    name: pkg.name,
    env,
    root: projectRoot,
    include: ['__tests__/integration/**/*.{test,spec}.{ts,mts}'],

    coverage: {
      provider: 'v8',
      exclude: ['__mocks__', '__tests__', 'src/index.ts'],
      include: ['src'],
    },

    fileParallelism: false,
  },
});
