import { defineEnv } from '@repo/env-config';
import { BASE_CONFIG } from '@repo/env-config/config';
import { APP_ENV, BASE_ENV } from '@repo/env-config/presets';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // Base
    ...BASE_ENV,
    // App
    ...APP_ENV,

    AUTH_SERVER_BASE_URL: z.url(),

    // Database
    DATABASE_URL: z.url(),

    // Key vault
    AZURE_KEY_VAULT_BASE_URL: z.url(),
  },
  ...BASE_CONFIG,
});
