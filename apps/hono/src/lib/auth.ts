import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { bearer } from 'better-auth/plugins';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const auth = new Lazy('auth', async () =>
  betterAuth({
    database: prismaAdapter(await prisma.resolve(), {
      provider: 'postgresql',
    }),
    plugins: [bearer()],
    advanced: {
      generateId: false,
    },
  }),
);
