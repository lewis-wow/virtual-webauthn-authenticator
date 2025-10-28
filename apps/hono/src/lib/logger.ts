import { Logger } from '@repo/logger';

import { Lazy } from './utils/Lazy';

const LOGGER_PREFIX = 'Hono';

export const logger = new Lazy(
  'logger',
  () => new Logger({ prefix: LOGGER_PREFIX }),
);
