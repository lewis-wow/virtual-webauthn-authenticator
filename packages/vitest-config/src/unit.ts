import {
  configDefaults,
  defineConfig,
  coverageConfigDefaults,
} from 'vitest/config';

export const unitConfig = defineConfig({
  test: {
    include: ['__tests__/unit/**/*.{test,spec}.{ts,mts}'],
    exclude: [...configDefaults.exclude, 'dist/**/*'],

    coverage: {
      provider: 'v8',
      exclude: [
        ...coverageConfigDefaults.exclude,
        '__tests__',
        'src/index.ts',
        'dist',
      ],
      include: ['src'],
    },
  },
});
