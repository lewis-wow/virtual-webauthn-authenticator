import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { prisma } from './prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [],
  advanced: {
    generateId: false,
  },
});
