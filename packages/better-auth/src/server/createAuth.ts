import { prisma } from '@repo/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins';
import { bearer } from 'better-auth/plugins';
import { openAPI } from 'better-auth/plugins';
import type { GithubOptions } from 'better-auth/social-providers';

export type CreateAuthArgs = {
  baseURL: string;
  basePath: string;
  socialProviders: {
    github: GithubOptions;
  };
};

export const createAuth = (args: CreateAuthArgs) =>
  betterAuth({
    ...args,
    trustedOrigins: ['http://localhost:3000', 'http://localhost:3002'],
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    plugins: [openAPI(), bearer(), jwt()],
    advanced: {
      generateId: false,
      crossSubDomainCookies: {
        enabled: true,
      },
    },
  });
