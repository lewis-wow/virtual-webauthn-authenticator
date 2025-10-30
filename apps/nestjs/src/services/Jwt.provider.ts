import { Provider } from '@nestjs/common';
import { Jwt } from '@repo/auth';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';
import { PrismaService } from './Prisma.service';

export const JwtProvider: Provider = {
  provide: Jwt,
  useFactory: (env: Env, prismaService: PrismaService) => {
    const jwt = new Jwt({
      prisma: prismaService,
      authServerBaseURL: env.AUTH_SERVER_BASE_URL,
      encryptionKey: env.ENCRYPTION_KEY,
      config: {
        aud: env.AUTH_SERVER_BASE_URL,
        iss: env.AUTH_SERVER_BASE_URL,
      },
    });

    return jwt;
  },
  inject: [ENV_PROVIDER_TOKEN, PrismaService],
};
