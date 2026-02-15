import { env } from '@/env';
import { ActivityLog } from '@repo/activity-log';
import { ApiKeyManager, JwtIssuer } from '@repo/auth';
import { JWT_ALG } from '@repo/auth';
import { Permission, TokenType } from '@repo/auth/enums';
import { PrismaAuthJwksRepository } from '@repo/auth/repositories';
import type { JwtPayload } from '@repo/auth/zod-validation';
import { Jwks, Jwt } from '@repo/crypto';
import { DependencyContainer } from '@repo/dependency-container';
import { Logger } from '@repo/logger';
import { PrismaClientExtended } from '@repo/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt as jwtPlugin, bearer } from 'better-auth/plugins';
import EventEmitter from 'node:events';

const LOG_PREFIX = 'AUTH-SERVER';

export const container = new DependencyContainer()
  .register('prisma', () => {
    return PrismaClientExtended.createInstance();
  })
  .register('logger', () => {
    return new Logger({
      prefix: LOG_PREFIX,
    });
  })
  .register('apiKeyManager', ({ prisma }) => {
    return new ApiKeyManager({
      prisma,
    });
  })
  .register('prismaAuthJwksRepository', ({ prisma }) => {
    return new PrismaAuthJwksRepository({
      prisma,
    });
  })
  .register('jwks', ({ prismaAuthJwksRepository }) => {
    return new Jwks({
      encryptionKey: env.ENCRYPTION_KEY,
      jwksRepository: prismaAuthJwksRepository,
    });
  })
  .register('jwt', ({ jwks }) => {
    return new Jwt({
      jwks,
    });
  })
  .register('jwtIssuer', ({ jwt }) => {
    return new JwtIssuer({
      jwt,
      config: {
        iss: env.JWT_ISSUER,
        aud: env.JWT_AUDIENCE,
      },
    });
  })
  .register('activityLog', ({ prisma }) => {
    const eventEmitter = new EventEmitter();

    return new ActivityLog({
      prisma,
      eventEmitter,
    });
  })
  .register('auth', ({ prisma, jwtIssuer }) => {
    return betterAuth({
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
        bearer(),
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

                permissions: Object.values(Permission),
                userId: payload.id as string,
                name: payload.name as string,
                email: payload.email as string,
                image: payload.image as string | null,
                apiKeyId: null,

                tokenType: TokenType.USER,
              };

              return await jwtIssuer.sign(jwtPayload);
            },
          },
        }),
      ],
      trustedOrigins: env.TRUSTED_ORIGINS,
      advanced: {
        database: {
          generateId: false,
        },
        cookies: {
          session_token: {
            name: 'session_token',
            attributes: {
              secure: process.env.NODE_ENV === 'production',
            },
          },
        },
      },
    });
  });
