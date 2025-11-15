import { defineConfig } from 'vitest/config';

import pkg from '../package.json';

export default defineConfig({
  test: {
    name: pkg.name,
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: ['__tests__', '__mocks__', 'src/index.ts'],
      include: ['src'],
    },
    fileParallelism: true,
  },
});
