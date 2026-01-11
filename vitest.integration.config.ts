import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['**/__tests__/vitest.integration.config.{ts,mts}'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      exclude: [...coverageConfigDefaults.exclude],
      include: ['**/src/**'],
    },
  },
});
