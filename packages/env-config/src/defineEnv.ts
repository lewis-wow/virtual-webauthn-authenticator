import { createEnv } from '@t3-oss/env-core';
import z from 'zod';

export const defineEnv: typeof createEnv = (options) => {
  const { data: skipValidation = false } = z.coerce
    .boolean()
    .safeParse(options.runtimeEnv?.SKIP_ENV_VALIDATION);

  return createEnv({
    ...options,
    emptyStringAsUndefined: true,

    /**
     * Skip validation in certain environments (e.g., during build time).
     * Can be controlled via SKIP_ENV_VALIDATION environment variable.
     */
    skipValidation,
  });
};
