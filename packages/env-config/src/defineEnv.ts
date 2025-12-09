import { createEnv } from '@t3-oss/env-core';

export const defineEnv: typeof createEnv = (options) => {
  return createEnv({
    ...options,
    emptyStringAsUndefined: true,

    /**
     * Skip validation in certain environments (e.g., during build time).
     * Can be controlled via SKIP_ENV_VALIDATION environment variable.
     */
    skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  });
};
