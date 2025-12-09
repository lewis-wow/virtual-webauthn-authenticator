import { defineEnv } from '@repo/env-config';
import { z } from 'zod';

export const env = defineEnv({
  clientPrefix: 'WXT_',
  client: {
    WXT_API_BASE_URL: z.url(),
  },
  runtimeEnv: import.meta.env,
});
