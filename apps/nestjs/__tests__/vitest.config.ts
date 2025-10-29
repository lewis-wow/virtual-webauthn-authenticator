import { config } from '@dotenvx/dotenvx';
import { join } from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

const env = config({
  path: join(import.meta.dirname, '..', '.env.test'),
  overload: true,
}).parsed;

console.log(env);

export default defineConfig({
  test: {
    name: pkg.name,
    env,
  },
  plugins: [tsconfigPaths()],
});
