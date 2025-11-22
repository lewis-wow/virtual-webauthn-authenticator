import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/**/__tests__/vitest.integration.config.{ts,mts}',
      'apps/*/__tests__/vitest.integration.config.{ts,mts}',
    ],
    fileParallelism: false,
  },
});
