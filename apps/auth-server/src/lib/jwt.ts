import { env } from '@/env';
import { Jwt } from '@repo/auth';

import { prisma } from './prisma';

export const jwt = new Jwt({
  prisma,
  authServerBaseURL: '/',
  encryptionKey: env.ENCRYPTION_KEY,
  config: {
    iss: env.JWT_ISSUER,
    aud: env.JWT_AUDIENCE,
  },
});
