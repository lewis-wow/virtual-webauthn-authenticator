import { Jwks, Jwt } from '@repo/crypto';
import { PrismaClient } from '@repo/prisma';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { JwtIssuer } from '../../src/JwtIssuer';
import { PrismaAuthJwksRepository } from '../../src/repositories/PrismaAuthJwksRepository';
import { MockJwtAudience } from '../helpers/MockJwtAudience';
import {
  API_KEY_ID,
  API_KEY_JWT_PAYLOAD,
  USER_ID,
  USER_JWT_PAYLOAD,
} from '../helpers/consts';
import { upsertTestingUser } from '../helpers/upsertTestingUser';

const prisma = new PrismaClient();

const cleanup = async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.jwks.deleteMany(),
  ]);
};

const ENCRYPTION_KEY = 'test-encryption-key';
const JWT_CONFIG = {
  iss: 'test-issuer',
  aud: 'test-audience',
};

const jwks = new Jwks({
  encryptionKey: ENCRYPTION_KEY,
  jwksRepository: new PrismaAuthJwksRepository({
    prisma,
  }),
});

const jwt = new Jwt({
  jwks,
});

describe('JWT', () => {
  let jwtIssuer: JwtIssuer;
  let jwtAudience: MockJwtAudience;

  beforeEach(async () => {
    await cleanup();
    await upsertTestingUser({ prisma });

    jwtIssuer = new JwtIssuer({
      jwt,
      config: JWT_CONFIG,
    });

    jwtAudience = new MockJwtAudience({
      config: JWT_CONFIG,
      jwksFactory: async () => {
        return await jwks.getJSONWebKeySet();
      },
    });
  });

  afterEach(async () => {
    await cleanup();
    vi.useRealTimers();
  });

  describe('JwtIssuer and JwtAudience', () => {
    test('should sign and validate a personal JWT', async () => {
      const token = await jwtIssuer.sign(USER_JWT_PAYLOAD);
      const validatedPayload = await jwtAudience.validateToken(token);
      expect(validatedPayload.sub).toBe(USER_ID);
    });

    test('should sign and validate an API key JWT', async () => {
      const token = await jwtIssuer.sign(API_KEY_JWT_PAYLOAD);
      const validatedPayload = await jwtAudience.validateToken(token);

      expect(validatedPayload.sub).toBe(API_KEY_ID);
      expect(validatedPayload.apiKeyId).toBe(API_KEY_ID);
    });

    test('should throw an error for an invalid token', async () => {
      await expect(
        jwtAudience.validateToken('invalid-token'),
      ).rejects.toThrow();
    });

    test('should throw an error for an expired token', async () => {
      vi.useFakeTimers();
      const token = await jwtIssuer.sign(USER_JWT_PAYLOAD);

      // Advance time by 16 minutes
      vi.advanceTimersByTime(16 * 60 * 1000);

      await expect(jwtAudience.validateToken(token)).rejects.toThrow();
    });
  });
});
