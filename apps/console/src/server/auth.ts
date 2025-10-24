import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { apiKey, bearer } from 'better-auth/plugins';
import { openAPI } from 'better-auth/plugins';

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
  plugins: [openAPI(), bearer(), apiKey()],
  advanced: {
    generateId: false,
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
