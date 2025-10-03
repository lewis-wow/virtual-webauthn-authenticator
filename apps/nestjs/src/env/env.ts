import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import { Environment } from '@repo/enums';

export const env = createEnv({
  server: {
    NODE_TLS_REJECT_UNAUTHORIZED: z.coerce.number().min(0).max(1).default(1),
    AZURE_POD_IDENTITY_AUTHORITY_HOST: z.url(),
    AZURE_KEY_VAULT_HOST: z.url(),

    ENVIRONMENT: z.enum(Environment),

    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),

    JWT_SECRET: z.string(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   */
  runtimeEnvStrict: {
    NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    AZURE_POD_IDENTITY_AUTHORITY_HOST:
      process.env.AZURE_POD_IDENTITY_AUTHORITY_HOST,
    AZURE_KEY_VAULT_HOST: process.env.AZURE_KEY_VAULT_HOST,

    ENVIRONMENT: process.env.ENVIRONMENT,

    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
  },

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
});
