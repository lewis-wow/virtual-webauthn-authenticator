import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
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
      .pipe(z.array(z.url())),

    // JWT
    JWT_ISSUER: z.string(),
    JWT_AUDIENCE: z.string(),
    ENCRYPTION_KEY: z.string(),

    // OAuth
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnv: process.env,

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
