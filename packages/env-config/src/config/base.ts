import z from 'zod';

import { getEnv } from '../getEnv';

export const BASE_CONFIG = {
  runtimeEnv: getEnv(),

  emptyStringAsUndefined: true,

  /**
   * Skip validation in certain environments (e.g., during build time).
   * Can be controlled via SKIP_ENV_VALIDATION environment variable.
   */
  skipValidation: !!z.stringbool().safeParse(getEnv('SKIP_ENV_VALIDATION'))
    .data,
} as const;
