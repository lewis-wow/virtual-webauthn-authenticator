import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

const env = config({
  path: join(import.meta.dirname, '..', '.env.test'),
  override: true,
}).parsed;

export default defineConfig({
  test: {
    name: pkg.name,
    env,
  },
});
