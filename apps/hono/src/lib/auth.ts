import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';
import { jwt } from 'better-auth/plugins';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const auth = new Lazy('auth', async () =>
  betterAuth({
    appName: 'Hono',
    logger: console,
    database: prismaAdapter(await prisma.resolve(), {
      provider: 'postgresql',
    }),
    plugins: [
      bearer({
        requireSignature: true,
      }),
      jwt({
        jwt: {
          issuer: 'http://localhost:3000',
        },
      }),
    ],
    advanced: {
      generateId: false,
    },
    session: {
      cookieCache: {
        enabled: false,
      },
    },
  }),
);
