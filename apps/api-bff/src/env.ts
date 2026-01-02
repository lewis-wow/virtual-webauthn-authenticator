import { defineEnv } from '@repo/env-config';
import { z } from 'zod';

export const env = defineEnv({
  server: {
    // App
    PORT: z.coerce.number(),
    BASE_URL: z.url(),

    // AUTH_BASE_URL: z.url(),
    // API_BASE_URL: z.url(),
  },
  runtimeEnv: process.env,
});
