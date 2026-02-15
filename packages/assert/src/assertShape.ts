import { Logger } from '@repo/logger';

import { TypeAssertionError } from './TypeAssertionError';
import { isShape } from './isShape';

const LOG_PREFIX = 'ASSERT_SHAPE';
const log = new Logger({
  prefix: LOG_PREFIX,
});

export function assertShape<T>(data: unknown, shape: T): asserts data is T {
  const result = isShape(data, shape);

  if (!result) {
    log.debug('Assert error', {
      data,
      shape,
    });

    throw new TypeAssertionError();
  }
}
