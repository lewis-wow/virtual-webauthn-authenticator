import { COVERAGE_EXCLUDE } from '@repo/vitest-config/consts';
import {
  configDefaults,
  defineConfig,
  coverageConfigDefaults,
} from 'vitest/config';

export const unitConfig = defineConfig({
  test: {
    include: ['__tests__/unit/**/*.{test,spec}.{ts,mts}'],
    exclude: [...configDefaults.exclude, 'dist/**/*', 'node_modules'],

    coverage: {
      provider: 'v8',
      excludeAfterRemap: true,
      exclude: [...coverageConfigDefaults.exclude, ...COVERAGE_EXCLUDE],
      include: ['**/src/**'],
    },
  },
});
