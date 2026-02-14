import { JwtIssuer } from '@repo/auth';
import { PrismaAuthJwksRepository } from '@repo/auth/repositories';
import { Jwks, Jwt } from '@repo/crypto';

import { JWT_CONFIG } from './consts';
import { prisma } from './prisma';

const ENCRYPTION_KEY = 'test-encryption-key';

export const jwks = new Jwks({
  encryptionKey: ENCRYPTION_KEY,
  jwksRepository: new PrismaAuthJwksRepository({
    prisma,
  }),
});

export const jwt = new Jwt({
  jwks,
});

export const jwtIssuer = new JwtIssuer({
  jwt,
  config: JWT_CONFIG,
});

export const getJSONWebKeySet = async () => {
  return await jwks.getJSONWebKeySet();
};
