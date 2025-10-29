import { env } from '@/env';
import { Jwt } from '@repo/auth';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt as jwtPlugin, bearer, apiKey } from 'better-auth/plugins';

import { jwt } from './jwt';
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
  plugins: [
    jwtPlugin({
      jwks: {
        remoteUrl: '/api/auth/jwks',
        keyPairConfig: {
          alg: Jwt.ALG,
        },
      },
      jwt: {
        sign: (payload) => jwt.sign({ ...payload, tokenType: 'USER' }),
      },
    }),
    bearer(),
    apiKey(),
  ],
  trustedOrigins: env.TRUSTED_ORIGINS,
  advanced: {
    generateId: false,
    cookies: {
      session_token: {
        name: 'session_token',
      },
    },
  },
});
