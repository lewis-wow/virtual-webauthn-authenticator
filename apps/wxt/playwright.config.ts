import { config } from '@dotenvx/dotenvx';
import { defineConfig, devices } from '@playwright/test';

config({ path: '.env.test' });

export default defineConfig({
  testDir: './e2e',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
