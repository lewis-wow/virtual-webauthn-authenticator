import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/**/__tests__/vitest.integration.config.{ts,mts}',
      'apps/**/__tests__/vitest.integration.config.{ts,mts}',
    ],
    globals: true,
    coverage: {
      provider: 'v8',
      exclude: ['__mocks__', '__tests__', 'src/index.ts'],
      include: ['src'],
    },
    fileParallelism: false,
  },
});
