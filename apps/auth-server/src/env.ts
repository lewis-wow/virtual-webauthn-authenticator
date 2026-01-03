import { defineEnv } from '@repo/env-config';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),

    HONO_BASE_URL: z.url(),
    NEXTJS_BASE_URL: z.url(),

    // Database
    DATABASE_URL: z.url(),

    // Better auth
    TRUSTED_ORIGINS: z
      .string()
      .transform((arg) => arg.split(';'))
      .pipe(z.array(z.string())),

    // JWT
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    ENCRYPTION_KEY: z.string(),

    // OAuth
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },
  runtimeEnv: process.env,
});
