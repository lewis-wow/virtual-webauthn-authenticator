import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['**/__tests__/vitest.*.config.{ts,mts}'],
    fileParallelism: false,
  },
});
