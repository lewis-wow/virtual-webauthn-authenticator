import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

export default defineConfig({
  test: {
    name: pkg.name,
    env: {
      ...config({ path: join(import.meta.dirname, '..', '.env.test') }).parsed,
    },
  },
});
