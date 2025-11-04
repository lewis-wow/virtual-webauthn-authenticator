import { env } from '@/env';
import { JwtIssuer } from '@repo/auth';

import { prisma } from './prisma';

export const jwtIssuer = new JwtIssuer({
  prisma,
  encryptionKey: env.ENCRYPTION_KEY,
  config: {
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  },
});
