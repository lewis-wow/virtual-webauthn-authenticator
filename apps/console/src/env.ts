import { defineEnv } from '@repo/env-config';
import { BASE_CONFIG } from '@repo/env-config/config';
import { APP_ENV, BASE_ENV, NEXTJS_ENV } from '@repo/env-config/presets';
import { z } from 'zod';

export const env = defineEnv({
  clientPrefix: 'NEXT_PUBLIC_',
  server: {
    // Base
    ...BASE_ENV,
    // App
    ...APP_ENV,

    API_BASE_URL: z.url(),
    AUTH_BASE_URL: z.url(),
  },
  client: {
    ...NEXTJS_ENV,
  },
  ...BASE_CONFIG,
});
