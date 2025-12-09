import { createEnv } from '@t3-oss/env-core';

/**
 * Creates a standardized environment configuration with common options.
 * This utility provides consistent behavior across all applications in the monorepo.
 *
 * It automatically sets:
 * - emptyStringAsUndefined: true
 * - skipValidation: controlled by SKIP_ENV_VALIDATION environment variable
 *
 * @param options - Environment configuration options (same as createEnv)
 * @returns A validated environment object
 *
 * @example
 * ```typescript
 * import { z } from 'zod';
 * import { createStandardEnv } from '@repo/env-config';
 *
 * export const env = createStandardEnv({
 *   server: {
 *     PORT: z.coerce.number(),
 *     DATABASE_URL: z.url(),
 *   },
 *   runtimeEnv: process.env,
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStandardEnv<T>(options: T): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createEnv({
    ...(options as any),
    /**
     * By default, this library will feed the environment variables directly to
     * the Zod validator.
     *
     * This means that if you have an empty string for a value that is supposed
     * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
     * it as a type mismatch violation. Additionally, if you have an empty string
     * for a value that is supposed to be a string with a default value (e.g.
     * `DOMAIN=` in an ".env" file), the default value will never be applied.
     *
     * In order to solve these issues, we recommend that all new projects
     * explicitly specify this option as true.
     */
    emptyStringAsUndefined: true,

    /**
     * Skip validation in certain environments (e.g., during build time).
     * Can be controlled via SKIP_ENV_VALIDATION environment variable.
     */
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
  });
}
