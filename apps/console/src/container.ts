import { TokenFetch } from '@repo/bff';
import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';
import { createAuthClient } from 'better-auth/client';
import { jwtClient } from 'better-auth/client/plugins';
import { nextCookies } from 'better-auth/next-js';

import { env } from './env';

const LOG_PREFIX = 'CONSOLE';

export const container = new DependencyContainer()
  .register('logger', () => {
    return new Logger({
      prefix: LOG_PREFIX,
    });
  })
  .register('authClient', () => {
    const authClient = createAuthClient({
      plugins: [jwtClient(), nextCookies()],
      baseURL: env.AUTH_BASE_URL,
    });

    return authClient;
  })
  .register('tokenFetch', ({ authClient }) => {
    return new TokenFetch({
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
