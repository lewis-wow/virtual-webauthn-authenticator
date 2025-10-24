import { authServerConfig } from '@repo/better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { merge } from 'lodash-es';

import { prisma } from './prisma';

export const auth = betterAuth(
  merge(
    {
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
    },
    authServerConfig,
  ),
);
