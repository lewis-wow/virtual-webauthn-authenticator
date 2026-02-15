import { defineEnv } from '@repo/env-config';
import { mapLogLevelTag } from '@repo/logger';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),
    ENVIRONMENT: z.enum(['production', 'development', 'test']),
    LOG_LEVEL: z
      .string()
      .optional()
      .transform((arg) => mapLogLevelTag(arg)),

    AUTH_SERVER_BASE_URL: z.url(),

    // Database
    DATABASE_URL: z.url(),

    // Key vault
    AZURE_KEY_VAULT_BASE_URL: z.url(),

    // JWKS
    ENCRYPTION_KEY: z.string(),
  },
  runtimeEnv: process.env,
});
