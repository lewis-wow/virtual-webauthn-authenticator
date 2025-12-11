import { defineEnv } from '@repo/env-config';
import { BASE_CONFIG } from '@repo/env-config/config';
import { BASE_ENV, APP_ENV } from '@repo/env-config/presets';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // Base
    ...BASE_ENV,
    // App
    ...APP_ENV,

    HONO_BASE_URL: z.url(),
    NEXTJS_BASE_URL: z.url(),

    // Database
    DATABASE_URL: z.url(),

    // Better auth
    TRUSTED_ORIGINS: z
      .string()
      .transform((arg) => arg.split(';'))
      .pipe(z.array(z.url())),

    // JWT
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    ENCRYPTION_KEY: z.string(),

    // OAuth
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  ...BASE_CONFIG,
});
