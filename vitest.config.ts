import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    exclude: ['apps/**'],
    globals: true,
    coverage: {
      enabled: true,
      provider: 'istanbul',
    },
  },
});
