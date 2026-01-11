import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['**/__tests__/vitest.unit.config.{ts,mts}'],
    coverage: {
      provider: 'v8',
      exclude: [...coverageConfigDefaults.exclude],
      include: ['**/src/**'],
    },
  },
});
