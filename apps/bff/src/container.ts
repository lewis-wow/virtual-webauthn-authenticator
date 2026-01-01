import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';

const LOG_PREFIX = 'BFF';

export const container = new DependencyContainer().register('logger', () => {
  return new Logger({
    prefix: LOG_PREFIX,
  });
});
