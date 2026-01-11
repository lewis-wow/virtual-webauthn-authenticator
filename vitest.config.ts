import { coverageConfigDefaults, defineConfig } from 'vitest/config';

import { COVERAGE_EXCLUDE } from './packages/vitest-config/src/consts';

export default defineConfig({
  test: {
    projects: ['**/__tests__/vitest.*.config.{ts,mts}'],
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      exclude: [...coverageConfigDefaults.exclude, ...COVERAGE_EXCLUDE],
      include: ['**/src/**'],
    },
  },
});
