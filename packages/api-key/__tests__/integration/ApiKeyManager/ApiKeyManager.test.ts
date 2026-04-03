import { PrismaClient } from '@repo/prisma';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { ApiKeyManager } from '../../../src/ApiKeyManager';
import { ApiKeyDeleteEnabledFailed } from '../../../src/exceptions/ApiKeyDeleteEnabledFailed';
import { ApiKeyNotFound } from '../../../src/exceptions/ApiKeyNotFound';
import { ApiKeyRevokeFailed } from '../../../src/exceptions/ApiKeyRevokeFailed';

describe('ApiKeyManager with Prisma', () => {
  const prisma = new PrismaClient();
  const apiKeyManager = new ApiKeyManager({ prisma });

  let testUserId: string;
  const createdApiKeyIds = new Set<string>();

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        email: `api-key-it-${Date.now()}@example.com`,
        name: 'API Key Integration User',
      },
    });

    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.apiKey.deleteMany({
      where: {
        id: {
          in: [...createdApiKeyIds],
        },
      },
    });

    if (testUserId) {
      await prisma.user.delete({
        where: {
          id: testUserId,
        },
      });
    }
  });

  test('Should generate and verify an API key', async () => {
    const generated = await apiKeyManager.generate({
      userId: testUserId,
      name: 'primary key',
    });

    createdApiKeyIds.add(generated.apiKey.id);

    expect(generated.plaintextKey).toMatch(
      /^sk_live_[A-Za-z0-9_-]+_[A-Za-z0-9_-]+$/,
    );
    expect(generated.apiKey.userId).toBe(testUserId);
    expect(
      generated.apiKey.metadata.createdWebAuthnPublicKeyCredentialCount,
    ).toBe(0);

    const verified = await apiKeyManager.verify(generated.plaintextKey);

    expect(verified).not.toBeNull();
    expect(verified!.id).toBe(generated.apiKey.id);
    expect(verified!.userId).toBe(testUserId);
    expect(verified!.metadata.createdWebAuthnPublicKeyCredentialCount).toBe(0);
  });

  test('Should return null for malformed key in verify()', async () => {
    const verified = await apiKeyManager.verify('invalid-key');
    expect(verified).toBeNull();
  });

  test('Should update and fetch an API key', async () => {
    const generated = await apiKeyManager.generate({
      userId: testUserId,
      name: 'updatable key',
    });
    createdApiKeyIds.add(generated.apiKey.id);

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    const updated = await apiKeyManager.update({
      userId: testUserId,
      id: generated.apiKey.id,
      data: {
        enabled: false,
        name: 'updated key',
        expiresAt,
      },
    });

    expect(updated.enabled).toBe(false);
    expect(updated.name).toBe('updated key');
    expect(updated.expiresAt?.toISOString()).toBe(expiresAt.toISOString());

    const fetched = await apiKeyManager.get({
      userId: testUserId,
      id: generated.apiKey.id,
    });

    expect(fetched.id).toBe(generated.apiKey.id);
    expect(fetched.enabled).toBe(false);
    expect(fetched.name).toBe('updated key');
    expect(fetched.metadata.createdWebAuthnPublicKeyCredentialCount).toBe(0);
  });

  test('Should throw ApiKeyNotFound when key does not exist', async () => {
    await expect(
      apiKeyManager.get({
        userId: testUserId,
        id: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ApiKeyNotFound);
  });

  test('Should paginate keys in list()', async () => {
    const generatedKeys = await Promise.all([
      apiKeyManager.generate({ userId: testUserId, name: 'list key 1' }),
      apiKeyManager.generate({ userId: testUserId, name: 'list key 2' }),
      apiKeyManager.generate({ userId: testUserId, name: 'list key 3' }),
    ]);

    for (const item of generatedKeys) {
      createdApiKeyIds.add(item.apiKey.id);
    }

    const firstPage = await apiKeyManager.list({
      userId: testUserId,
      limit: 2,
    });

    expect(firstPage.data).toHaveLength(2);
    expect(firstPage.meta.hasNext).toBe(true);
    expect(firstPage.meta.nextCursor).toBeTruthy();

    const secondPage = await apiKeyManager.list({
      userId: testUserId,
      limit: 2,
      cursor: firstPage.meta.nextCursor ?? undefined,
    });

    expect(secondPage.data.length).toBeGreaterThanOrEqual(1);
  });

  test('Should revoke key and reject verification afterwards', async () => {
    const generated = await apiKeyManager.generate({
      userId: testUserId,
      name: 'revokable key',
    });
    createdApiKeyIds.add(generated.apiKey.id);

    const revoked = await apiKeyManager.revoke({
      userId: testUserId,
      id: generated.apiKey.id,
    });

    expect(revoked.revokedAt).toBeInstanceOf(Date);

    const verifiedAfterRevoke = await apiKeyManager.verify(
      generated.plaintextKey,
    );
    expect(verifiedAfterRevoke).toBeNull();
  });

  test('Should throw ApiKeyRevokeFailed when revoking unknown key', async () => {
    await expect(
      apiKeyManager.revoke({
        userId: testUserId,
        id: randomUUID(),
      }),
    ).rejects.toBeInstanceOf(ApiKeyRevokeFailed);
  });

  test('Should delete disabled API key', async () => {
    const generated = await apiKeyManager.generate({
      userId: testUserId,
      name: 'deletable key',
    });
    createdApiKeyIds.add(generated.apiKey.id);

    await apiKeyManager.update({
      userId: testUserId,
      id: generated.apiKey.id,
      data: {
        enabled: false,
      },
    });

    const deleted = await apiKeyManager.delete({
      userId: testUserId,
      id: generated.apiKey.id,
    });

    createdApiKeyIds.delete(generated.apiKey.id);
    expect(deleted.id).toBe(generated.apiKey.id);

    const inDb = await prisma.apiKey.findUnique({
      where: {
        id: generated.apiKey.id,
      },
    });

    expect(inDb).toBeNull();
  });

  test('Should throw ApiKeyDeleteEnabledFailed for enabled key', async () => {
    const generated = await apiKeyManager.generate({
      userId: testUserId,
      name: 'enabled key',
    });
    createdApiKeyIds.add(generated.apiKey.id);

    await expect(
      apiKeyManager.delete({
        userId: testUserId,
        id: generated.apiKey.id,
      }),
    ).rejects.toBeInstanceOf(ApiKeyDeleteEnabledFailed);

    createdApiKeyIds.delete(generated.apiKey.id);
  });
});
