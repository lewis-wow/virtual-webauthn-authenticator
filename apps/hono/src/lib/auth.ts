import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { apiKey, bearer } from 'better-auth/plugins';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const auth = new Lazy('auth', () =>
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    plugins: [
      bearer(),
      apiKey({
        requireName: true,
        defaultPrefix: 'virtual-webauthn-authenticator_',
      }),
    ],
    advanced: {
      generateId: false,
    },
  }),
);
