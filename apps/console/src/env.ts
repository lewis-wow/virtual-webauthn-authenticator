import { defineEnv } from '@repo/env-config';
import { mapLogLevelTag } from '@repo/logger';
import { z } from 'zod';

export const env = defineEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),
    ENVIRONMENT: z.enum(['production', 'development', 'test']),
    LOG_LEVEL: z
      .string()
      .optional()
      .transform((arg) => mapLogLevelTag(arg)),

    API_BASE_URL: z.url(),
    AUTH_BASE_URL: z.url(),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
