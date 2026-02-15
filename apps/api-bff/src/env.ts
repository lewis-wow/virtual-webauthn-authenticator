import { defineEnv } from '@repo/env-config';
import { mapLogLevelTag } from '@repo/logger';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),
    LOG_LEVEL: z
      .string()
      .optional()
      .transform((arg) => mapLogLevelTag(arg)),

    // Other apps
    AUTH_BASE_URL: z.url(),
    API_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
