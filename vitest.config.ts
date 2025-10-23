import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'packages/**/__tests__/vitest.config.ts',
      'apps/**/__tests__/vitest.config.ts',
    ],
    globals: true,
    coverage: {
      enabled: false,
      provider: 'istanbul',
    },
  },
});
