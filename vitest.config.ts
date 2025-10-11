import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/**/__tests__/vitest.config.ts'],
    exclude: ['apps/**'],
    globals: true,
    coverage: {
      enabled: false,
      provider: 'istanbul',
    },
  },
});
