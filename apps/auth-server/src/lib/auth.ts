import { env } from '@/env';
import { JWT_ALG } from '@repo/auth';
import { TokenType } from '@repo/enums';
import { type JwtPayload } from '@repo/validation';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt as jwtPlugin, bearer, apiKey } from 'better-auth/plugins';

import { jwtIssuer } from './jwtIssuer';
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
        remoteUrl: `${env.BASE_URL}/.well-known/jwks.json`,
        keyPairConfig: {
          alg: JWT_ALG,
        },
      },
      jwt: {
        sign: async (payload) => {
          const jwtPayload: JwtPayload = {
            aud: payload.aud,
            exp: payload.exp,
            iat: payload.iat,
            iss: payload.iss,
            jti: payload.jti,
            nbf: payload.nbf,
            sub: payload.sub,
            user: {
              id: payload.id as string,
              name: payload.name as string,
              email: payload.email as string,
              emailVerified: payload.emailVerified as boolean,
              image: payload.image as string | null,
              createdAt: payload.createdAt as Date,
              updatedAt: payload.updatedAt as Date,
            },
            tokenType: TokenType.PERSONAL,
          };

          return await jwtIssuer.sign(jwtPayload);
        },
      },
    }),
    bearer(),
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
