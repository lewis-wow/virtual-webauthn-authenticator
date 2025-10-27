import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt, bearer } from 'better-auth/plugins';

import { prisma } from './prisma';

export const auth = betterAuth({
  appName: 'Auth',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [jwt(), bearer()],
  trustedOrigins: ['http://localhost:3000', 'http://localhost:3001'],
  advanced: {
    generateId: false,
    cookies: {
      session_token: {
        name: 'session_token',
      },
    },
  },
});
