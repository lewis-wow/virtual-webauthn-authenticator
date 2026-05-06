import { TokenFetch } from '@repo/bff';
import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';

import { env } from './env';

const LOG_PREFIX = 'BFF';

export const container = new DependencyContainer()
  .register('logger', () => {
    return new Logger({
      prefix: LOG_PREFIX,
      level: env.LOG_LEVEL,
    });
  })
  .register('tokenFetch', () => {
    return new TokenFetch({
      fetch: async (opts: { apiKey: string }) => {
        const response = await fetch(
          `${env.AUTH_BASE_URL}/api/auth/api-keys/token`,
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
