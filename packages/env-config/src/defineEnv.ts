import { createEnv } from '@t3-oss/env-core';

export const defineEnv: typeof createEnv = (options) => {
  const skipValidation =
    (typeof process !== 'undefined' &&
      process.env?.SKIP_ENV_VALIDATION === 'true') ||
    (typeof import.meta !== 'undefined' &&
      // @ts-expect-error - import.meta might not be typed in all environments
      import.meta.env?.SKIP_ENV_VALIDATION === 'true');

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
