import { BFFLogger, TokenFetch } from '@repo/bff';
import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';
import { LRUCache } from 'lru-cache';

const LOG_PREFIX = 'BFF';

export const container = new DependencyContainer()
  .register('logger', () => {
    return new Logger({
      prefix: LOG_PREFIX,
    });
  })
  .register('bffLogger', ({ logger }) => {
    return new BFFLogger({
      logger,
    });
  })
  .register('cache', () => {
    return new LRUCache<string, string>({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hour in milliseconds
    });
  })
  .register('tokenFetch', ({ cache }) => {
    return new TokenFetch({
      cache,
      fetch: async (opts: { apiKey: string }) => {
        const response = await fetch(
          'http://localhost:3002/api/auth/api-keys/token',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${opts.apiKey}`,
            },
          },
        );

        const { token } = (await response.json()) as { token: string };

        return token;
      },
    });
  });
