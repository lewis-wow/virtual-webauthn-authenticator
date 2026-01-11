import { config } from '@dotenvx/dotenvx';
import { integrationConfig } from '@repo/vitest-config/integration';
import { join } from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig, mergeConfig, Plugin } from 'vitest/config';

import pkg from '../package.json';

const env = config({
  path: [
    join(import.meta.dirname, '..', '..', '..', '.env.test'),
    join(import.meta.dirname, '..', '.env.test'),
  ],
  override: true,
}).parsed;

const projectRoot = join(import.meta.dirname, '..');

export default mergeConfig(
  integrationConfig,
  defineConfig({
    test: {
      name: `${pkg.name}/integration`,
      env,
      root: projectRoot,
      fileParallelism: false,
    },
    plugins: [swc.vite() as Plugin],
  }),
);
