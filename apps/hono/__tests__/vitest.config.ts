import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
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
  // @ts-expect-error - No overload matches this call.
  plugins: [tsconfigPaths()],
});
