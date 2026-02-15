import { Logger } from '@repo/logger';
import z from 'zod';

import { TypeAssertionError } from './TypeAssertionError';

const LOG_PREFIX = 'ASSERT_SCHEMA';
const log = new Logger({
  prefix: LOG_PREFIX,
});

/**
 * Asserts that the given data matches the provided Zod schema.
 * If validation fails, it throws a ZodError.
 * If it succeeds, TypeScript narrows the type of 'data'.
 */
export function assertSchema<T extends z.ZodTypeAny>(
  data: unknown,
  schema: T,
): asserts data is z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    log.debug('Assert error', {
      error: result.error,
      data,
    });

    throw new TypeAssertionError(result.error);
  }
}
