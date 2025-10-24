import { authServerConfig } from '@repo/better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { merge } from 'lodash-es';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const auth = new Lazy('auth', () =>
  betterAuth(
    merge(
      {
        database: prismaAdapter(prisma, {
          provider: 'postgresql',
        }),
      },
      authServerConfig,
    ),
  ),
);
