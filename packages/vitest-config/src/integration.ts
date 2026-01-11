import {
  configDefaults,
  coverageConfigDefaults,
  defineConfig,
} from 'vitest/config';

export const integrationConfig = defineConfig({
  test: {
    include: ['__tests__/integration/**/*.{test,spec}.{ts,mts}'],
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

    fileParallelism: false,
  },
});
