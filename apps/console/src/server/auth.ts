import { authServerConfig } from '@repo/better-auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';
import { openAPI } from 'better-auth/plugins';
import { merge } from 'lodash-es';

import { prisma } from './prisma';

export const auth = betterAuth(
  merge(
    {
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
      },
      plugins: [openAPI(), bearer()],
    },
    authServerConfig,
  ),
);
