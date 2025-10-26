import { env } from '@/env';
import { Jwt } from '@repo/jwt';

import { prisma } from './prisma';
import { Lazy } from './utils/Lazy';

export const jwt = new Lazy(
  'jwt',
  async () =>
    new Jwt({
      prisma: await prisma.resolve(),
      currentKid: env.JWT_CURRENT_JWK_KID,
      encryptionKey: env.JWK_PRIVATE_KEY_ENCRYPTION_SECRET,
      config: {
        issuer: env.JWT_ISSUER,
        audience: env.JWT_AUDIENCE,
      },
    }),
);
