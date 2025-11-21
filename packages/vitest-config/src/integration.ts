import { configDefaults, defineConfig } from 'vitest/config';

export const integrationConfig = defineConfig({
  test: {
    include: ['__tests__/integration/**/*.{test,spec}.{ts,mts}'],
    exclude: [...configDefaults.exclude, 'dist/**/*'],

    coverage: {
      provider: 'v8',
      exclude: ['__mocks__', '__tests__', 'src/index.ts'],
      include: ['src'],
    },

    fileParallelism: false,
  },
});
