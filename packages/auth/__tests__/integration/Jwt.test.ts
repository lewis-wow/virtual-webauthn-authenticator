import { MockJwtAudience } from '../../__mocks__/MockJwtAudience.mock';

import {
  API_KEY_ID,
  MOCK_API_KEY_JWT_PAYLOAD,
  MOCK_PERSONAL_JWT_PAYLOAD,
  upsertTestingUser,
  USER_ID,
} from '@repo/core';
import { PrismaClient } from '@repo/prisma';
import { ApiKeyJwtPayload } from '@repo/validation';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { JwtIssuer } from '../../src/JwtIssuer';
import { JwtUtils } from '../../src/JwtUtils';

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

describe('JWT', () => {
  let jwtIssuer: JwtIssuer;
  let jwtAudience: MockJwtAudience;

  beforeEach(async () => {
    await cleanup();
    await upsertTestingUser({ prisma });

    jwtIssuer = new JwtIssuer({
      prisma,
      encryptionKey: ENCRYPTION_KEY,
      config: JWT_CONFIG,
    });

    jwtAudience = new MockJwtAudience({
      config: JWT_CONFIG,
      jwksFactory: async () => {
        return await jwtIssuer.jsonWebKeySet();
      },
    });
  });

  afterEach(async () => {
    await cleanup();
    vi.useRealTimers();
  });

  describe('JwtIssuer and JwtAudience', () => {
    test('should sign and validate a personal JWT', async () => {
      const token = await jwtIssuer.sign(MOCK_PERSONAL_JWT_PAYLOAD);
      const validatedPayload = await jwtAudience.validateToken(token);
      expect(validatedPayload.sub).toBe(USER_ID);
    });

    test('should sign and validate an API key JWT', async () => {
      const token = await jwtIssuer.sign(MOCK_API_KEY_JWT_PAYLOAD);
      const validatedPayload = await jwtAudience.validateToken(token);

      expect(validatedPayload.sub).toBe(API_KEY_ID);
      expect((validatedPayload as ApiKeyJwtPayload).apiKey.id).toBe(API_KEY_ID);
    });

    test('should throw an error for an invalid token', async () => {
      await expect(
        jwtAudience.validateToken('invalid-token'),
      ).rejects.toThrow();
    });

    test('should throw an error for an expired token', async () => {
      vi.useFakeTimers();
      const token = await jwtIssuer.sign(MOCK_PERSONAL_JWT_PAYLOAD);

      // Advance time by 16 minutes
      vi.advanceTimersByTime(16 * 60 * 1000);

      await expect(jwtAudience.validateToken(token)).rejects.toThrow();
    });
  });

  describe('JwtUtils', () => {
    test('should identify a personal JWT payload', () => {
      expect(JwtUtils.isPersonalJwtPayload(MOCK_PERSONAL_JWT_PAYLOAD)).toBe(
        true,
      );

      expect(JwtUtils.isPersonalJwtPayload(MOCK_API_KEY_JWT_PAYLOAD)).toBe(
        false,
      );
    });

    test('should identify an API key JWT payload', () => {
      expect(JwtUtils.isApiKeyJwtPayload(MOCK_API_KEY_JWT_PAYLOAD)).toBe(true);

      expect(JwtUtils.isApiKeyJwtPayload(MOCK_PERSONAL_JWT_PAYLOAD)).toBe(
        false,
      );
    });
  });
});
