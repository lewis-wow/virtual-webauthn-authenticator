import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*'],
    globals: true,
    coverage: {
      provider: 'istanbul',
    },
  },
});
