import { env } from '@/env';
import { Jwt } from '@repo/jwt';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const jwt = new Lazy(
  'jwt',
  async () =>
    new Jwt({
      prisma: await prisma.resolve(),
      currentKid: '5858dff7-ad5f-432e-a41d-851ceda96ac6',
      encryptionKey: 'secret',
      config: {
        issuer: 'http://localhost:3000',
        audience: env.BASE_URL,
      },
    }),
);
