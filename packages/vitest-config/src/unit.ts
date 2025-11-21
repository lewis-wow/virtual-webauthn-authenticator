import { configDefaults, defineConfig } from 'vitest/config';

export const unitConfig = defineConfig({
  test: {
    include: ['__tests__/unit/**/*.{test,spec}.{ts,mts}'],
    exclude: [...configDefaults.exclude, 'dist/**/*'],

    coverage: {
      provider: 'v8',
      exclude: ['__mocks__', '__tests__', 'src/index.ts'],
      include: ['src'],
    },
  },
});
