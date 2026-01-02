import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';
import { LRUCache } from 'lru-cache';

import { JwtFetcher } from './JwtFetcher';

const LOG_PREFIX = 'BFF';

export const container = new DependencyContainer()
  .register('logger', () => {
    return new Logger({
      prefix: LOG_PREFIX,
    });
  })
  .register('cache', () => {
    return new LRUCache<string, string>({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hour in milliseconds
    });
  })
  .register('jwtFetcher', ({ cache }) => {
    return new JwtFetcher({
      cache,
      config: {
        authEndpoint: 'http://localhost:3002/api/auth/api-keys/token',
      },
    });
  });
