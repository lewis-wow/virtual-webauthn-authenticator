import { COVERAGE_EXCLUDE } from '@repo/vitest-config/consts';
import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config';

export const integrationConfig = defineConfig({
  test: {
    include: ['__tests__/integration/**/*.{test,spec}.{ts,mts}'],
    exclude: [...configDefaults.exclude, 'dist/**/*', 'node_modules'],

    coverage: {
      provider: 'v8',
      exclude: [...coverageConfigDefaults.exclude, ...COVERAGE_EXCLUDE],
      include: ['**/src/**'],
    },

    fileParallelism: false,
  },
});
