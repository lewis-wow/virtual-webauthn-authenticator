import { BFFLogger, TokenFetch } from '@repo/bff';
import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';
import { LRUCache } from 'lru-cache';

import { env } from './env';

const LOG_PREFIX = 'CONSOLE';

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
  .register('authClient', () => {
    const authClient = createAuthClient({
      plugins: [jwtClient(), nextCookies()],
      baseURL: env.AUTH_BASE_URL,
    });

    return authClient;
  })
  .register('cache', () => {
    return new LRUCache<string, string>({
      max: 100,
      ttl: 1000 * 60 * 60, // 1 hour in milliseconds
    });
  })
  .register('tokenFetch', ({ cache, authClient }) => {
    return new TokenFetch({
      cache,
      fetch: async (opts: { headers: Headers }) => {
        const { data } = await authClient.token({
          fetchOptions: {
            headers: opts.headers,
          },
        });

        return data?.token ?? null;
      },
    });
  });
