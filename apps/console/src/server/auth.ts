import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { jwt } from 'better-auth/plugins';
import { bearer } from 'better-auth/plugins';

import { prisma } from './prisma';

export const auth = betterAuth({
  logger: console,
  appName: 'Console',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  plugins: [
    nextCookies(),
    bearer(),
    jwt({
      jwt: {
        audience: process.env.API_BASE_URL,
      },
    }),
  ],
  advanced: {
    generateId: false,
    cookies: {
      session_token: {
        name: 'session_token',
      },
    },
  },
});
