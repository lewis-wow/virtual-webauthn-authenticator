import { defineEnv } from '@repo/env-config';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),
    ENVIRONMENT: z.enum(['production', 'development', 'test']),

    AUTH_SERVER_BASE_URL: z.url(),

    // Database
    DATABASE_URL: z.url(),

    // Crypto
    ENCRYPTION_KEY: z.string(),

    // Key vault
    AZURE_KEY_VAULT_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
