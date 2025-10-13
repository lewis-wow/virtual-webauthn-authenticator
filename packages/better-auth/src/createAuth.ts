import { prisma } from '@repo/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import type { GithubOptions } from 'better-auth/social-providers';

export type CreateAuthArgs = {
  github: GithubOptions;
};

export const createAuth = ({ github }: CreateAuthArgs) =>
  betterAuth({
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    socialProviders: {
      github,
    },
  });
