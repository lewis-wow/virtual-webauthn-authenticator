import { PrismaClient } from '@repo/prisma';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { ApiKeyManager } from '../../src/ApiKeyManager';
import { USER_ID } from '../helpers/consts';
import { upsertTestingUser } from '../helpers/upsertTestingUser';

const prisma = new PrismaClient();

const cleanup = async () => {
  await prisma.$transaction([
    prisma.user.deleteMany(),
    prisma.apiKey.deleteMany(),
  ]);
};

describe('ApiKeyManager', () => {
  let apiKeyManager: ApiKeyManager;

  beforeEach(async () => {
    await cleanup();
    await upsertTestingUser({ prisma });
    apiKeyManager = new ApiKeyManager({ prisma });
  });

  afterEach(async () => {
    await cleanup();
  });

  describe('generate()', () => {
    test('should generate a new API key', async () => {
      const { plaintextKey, apiKey } = await apiKeyManager.generate({
        userId: USER_ID,
        name: 'Test Key',
      });

      expect(plaintextKey).toBeDefined();
      expect(apiKey).toBeDefined();
      expect(apiKey.userId).toBe(USER_ID);
      expect(apiKey.name).toBe('Test Key');

      expect(plaintextKey).toEqual(
        expect.stringMatching(/^sk_live_[a-zA-Z0-9_-]+$/),
      );
    });
  });

  describe('verify()', () => {
    test('should verify a valid API key', async () => {
      const { plaintextKey } = await apiKeyManager.generate({
        userId: USER_ID,
      });
      const verifiedKey = await apiKeyManager.verify(plaintextKey);
      expect(verifiedKey).toBeDefined();
    });

    test('should not verify an invalid API key', async () => {
      const verifiedKey = await apiKeyManager.verify('invalid_key');
      expect(verifiedKey).toBeNull();
    });
  });

  describe('revoke()', () => {
    test('should revoke an API key', async () => {
      const { apiKey } = await apiKeyManager.generate({ userId: USER_ID });
      const revokedKey = await apiKeyManager.revoke({
        userId: USER_ID,
        id: apiKey.id,
      });
      expect(revokedKey.revokedAt).toBeDefined();
    });
  });

  describe('update()', () => {
    test('should update an API key', async () => {
      const { apiKey } = await apiKeyManager.generate({ userId: USER_ID });
      const updatedKey = await apiKeyManager.update({
        userId: USER_ID,
        id: apiKey.id,
        data: { name: 'Updated Key' },
      });
      expect(updatedKey.name).toBe('Updated Key');
    });
  });

  describe('delete()', () => {
    test('should delete an API key', async () => {
      const { apiKey } = await apiKeyManager.generate({ userId: USER_ID });
      await apiKeyManager.update({
        userId: USER_ID,
        id: apiKey.id,
        data: { enabled: false },
      });
      const deletedKey = await apiKeyManager.delete({
        userId: USER_ID,
        id: apiKey.id,
      });
      expect(deletedKey).toBeDefined();
      await expect(
        apiKeyManager.get({ userId: USER_ID, id: apiKey.id }),
      ).rejects.toThrow();
    });
  });

  describe('get()', () => {
    test('should get an API key', async () => {
      const { apiKey } = await apiKeyManager.generate({ userId: USER_ID });
      const foundKey = await apiKeyManager.get({
        userId: USER_ID,
        id: apiKey.id,
      });
      expect(foundKey).toBeDefined();
    });
  });

  describe('list()', () => {
    test('should list all API keys for a user', async () => {
      await apiKeyManager.generate({ userId: USER_ID });
      await apiKeyManager.generate({ userId: USER_ID });
      const keys = await apiKeyManager.list({ userId: USER_ID });
      expect(keys.data.length).toBe(2);
    });
  });
});
