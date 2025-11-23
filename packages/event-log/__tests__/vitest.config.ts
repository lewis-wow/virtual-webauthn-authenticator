import { unitConfig } from '@repo/vitest-config/unit';
import { join } from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';

import pkg from '../package.json';

const projectRoot = join(import.meta.dirname, '..');

export default mergeConfig(
  unitConfig,
  defineConfig({
    test: {
      name: pkg.name,
      root: projectRoot,
    },
  }),
);
