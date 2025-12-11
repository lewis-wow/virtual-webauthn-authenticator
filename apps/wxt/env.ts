import { defineEnv } from '@repo/env-config';
import { BASE_CONFIG } from '@repo/env-config/config';
import { WXT_ENV } from '@repo/env-config/presets';
import { z } from 'zod';

export const env = defineEnv({
  clientPrefix: 'WXT_',
  client: {
    ...WXT_ENV,

    WXT_API_BASE_URL: z.url(),
  },
  ...BASE_CONFIG,
});
