import { PrismaClient } from '@repo/prisma';
import EventEmitter from 'node:events';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { ActivityLog } from '../../../src/ActivityLog';
import { LogAction } from '../../../src/enums/LogAction';
import { LogEntity } from '../../../src/enums/LogEntity';

/**
 * Integration tests for ActivityLog.audit() method with Prisma ORM
 *
 * These tests verify that the ActivityLog class correctly handles:
 * - Creating log entries in the database
 * - Storing metadata properly
 * - Handling nullable fields
 * - Graceful error handling via event emission
 */
describe('ActivityLog.audit() with Prisma', () => {
  const prisma = new PrismaClient();
  const eventEmitter = new EventEmitter();

  const activityLog = new ActivityLog({
    prisma,
    eventEmitter,
  });

  let testUserId: string;
  let testApiKeyId: string;
  const createdLogIds: string[] = [];

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: `activity-log-test-${Date.now()}@example.com`,
        name: 'Activity Log Test User',
      },
    });
    testUserId = user.id;

    // Create a test API key for foreign key constraint
    const apiKey = await prisma.apiKey.create({
      data: {
        name: 'Test API Key',
        userId: testUserId,
        hashedKey: 'test-hashed-key',
        lookupKey: `test-lookup-key-${Date.now()}`,
      },
    });
    testApiKeyId = apiKey.id;
  });

  afterAll(async () => {
    // Clean up created logs
    await prisma.log.deleteMany({
      where: {
        id: {
          in: createdLogIds,
        },
      },
    });

    // Clean up test API key
    if (testApiKeyId) {
      await prisma.apiKey.delete({
        where: {
          id: testApiKeyId,
        },
      });
    }

    // Clean up test user
    if (testUserId) {
      await prisma.user.delete({
        where: {
          id: testUserId,
        },
      });
    }
  });

  test('Should create a log entry with all fields', async () => {
    await activityLog.audit({
      action: LogAction.CREATE,
      entity: LogEntity.CREDENTIAL,
      entityId: '123e4567-e89b-12d3-a456-426614174000',
      userId: testUserId,
      apiKeyId: testApiKeyId,
      metadata: {
        ip: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      },
    });

    // Verify the log was created
    const logs = await prisma.log.findMany({
      where: {
        userId: testUserId,
        action: LogAction.CREATE,
        entity: LogEntity.CREDENTIAL,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    expect(logs).toHaveLength(1);
    const log = logs[0]!;

    createdLogIds.push(log.id);

    expect(log.action).toBe(LogAction.CREATE);
    expect(log.entity).toBe(LogEntity.CREDENTIAL);
    expect(log.entityId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(log.userId).toBe(testUserId);
    expect(log.apiKeyId).toBe(testApiKeyId);
    expect(log.apiKeyIdReference).toBe(testApiKeyId);
    expect(log.metadata).toEqual({
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });
    expect(log.createdAt).toBeInstanceOf(Date);
    expect(log.updatedAt).toBeInstanceOf(Date);
  });

  test('Should create a log entry with minimal fields', async () => {
    await activityLog.audit({
      action: LogAction.GET,
      entity: LogEntity.API_KEY,
      userId: testUserId,
      entityId: null,
      apiKeyId: null,
      metadata: null,
    });

    // Verify the log was created
    const logs = await prisma.log.findMany({
      where: {
        userId: testUserId,
        action: LogAction.GET,
        entity: LogEntity.API_KEY,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    expect(logs).toHaveLength(1);
    const log = logs[0]!;

    createdLogIds.push(log.id);

    expect(log.action).toBe(LogAction.GET);
    expect(log.entity).toBe(LogEntity.API_KEY);
    expect(log.entityId).toBeNull();
    expect(log.userId).toBe(testUserId);
    expect(log.apiKeyId).toBeNull();
    expect(log.apiKeyIdReference).toBeNull();
    expect(log.metadata).toBeNull();
  });

  test('Should create log entry without optional fields', async () => {
    await activityLog.audit({
      action: LogAction.LIST,
      entity: LogEntity.WEBAUTHN_PUBLIC_KEY_CREDENTIAL,
      userId: testUserId,
    });

    // Verify the log was created
    const logs = await prisma.log.findMany({
      where: {
        userId: testUserId,
        action: LogAction.LIST,
        entity: LogEntity.WEBAUTHN_PUBLIC_KEY_CREDENTIAL,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    expect(logs).toHaveLength(1);
    const log = logs[0]!;

    createdLogIds.push(log.id);

    expect(log.action).toBe(LogAction.LIST);
    expect(log.entity).toBe(LogEntity.WEBAUTHN_PUBLIC_KEY_CREDENTIAL);
    expect(log.userId).toBe(testUserId);
    expect(log.entityId).toBeNull();
    expect(log.apiKeyId).toBeNull();
    expect(log.metadata).toBeNull();
  });

  test('Should create multiple log entries', async () => {
    const actions = [LogAction.CREATE, LogAction.UPDATE, LogAction.DELETE];

    for (const action of actions) {
      await activityLog.audit({
        action,
        entity: LogEntity.CREDENTIAL,
        entityId: '333e4567-e89b-12d3-a456-426614174000',
        userId: testUserId,
        metadata: {
          action,
          timestamp: Date.now(),
        },
      });
    }

    const logs = await prisma.log.findMany({
      where: {
        userId: testUserId,
        entityId: '333e4567-e89b-12d3-a456-426614174000',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    expect(logs).toHaveLength(3);
    createdLogIds.push(...logs.map((log) => log.id));

    expect(logs[0]!.action).toBe(LogAction.CREATE);
    expect(logs[1]!.action).toBe(LogAction.UPDATE);
    expect(logs[2]!.action).toBe(LogAction.DELETE);
  });

  test('Should store complex metadata', async () => {
    const complexMetadata = {
      user: {
        id: testUserId,
        role: 'admin',
      },
      request: {
        method: 'POST',
        path: '/api/credentials',
        headers: {
          'user-agent': 'Mozilla/5.0',
          'content-type': 'application/json',
        },
      },
      response: {
        status: 201,
        data: {
          id: '444e4567-e89b-12d3-a456-426614174000',
          created: true,
        },
      },
      tags: ['important', 'security'],
      count: 42,
    };

    await activityLog.audit({
      action: LogAction.CREATE,
      entity: LogEntity.API_KEY,
      userId: testUserId,
      metadata: complexMetadata,
    });

    const logs = await prisma.log.findMany({
      where: {
        userId: testUserId,
        action: LogAction.CREATE,
        entity: LogEntity.API_KEY,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
    });

    expect(logs).toHaveLength(1);
    const log = logs[0]!;

    createdLogIds.push(log.id);

    expect(log.metadata).toEqual(complexMetadata);
  });

  test('Should emit error event when audit fails', async () => {
    // Create an ActivityLog instance with a failing prisma client
    const failingPrisma = {
      log: {
        create: async () => {
          throw new Error('Database connection failed');
        },
      },
    } as unknown as PrismaClient;

    const capturedErrors: unknown[] = [];
    const testEventEmitter = new EventEmitter();

    testEventEmitter.on('error', ({ error }) => {
      capturedErrors.push(error);
    });

    const failingActivityLog = new ActivityLog({
      prisma: failingPrisma,
      eventEmitter: testEventEmitter,
    });

    // Should not throw even though audit fails
    await expect(
      failingActivityLog.audit({
        action: LogAction.CREATE,
        entity: LogEntity.CREDENTIAL,
        userId: testUserId,
      }),
    ).resolves.toBeUndefined();

    // Verify the error event was emitted
    expect(capturedErrors).toHaveLength(1);
    expect(capturedErrors[0]).toBeInstanceOf(Error);
    expect((capturedErrors[0] as Error).message).toBe(
      'Database connection failed',
    );
  });

  test('Should support multiple error listeners', async () => {
    const failingPrisma = {
      log: {
        create: async () => {
          throw new Error('Test error');
        },
      },
    } as unknown as PrismaClient;

    const errors1: unknown[] = [];
    const errors2: unknown[] = [];
    const testEventEmitter = new EventEmitter();

    testEventEmitter.on('error', ({ error }) => {
      errors1.push(error);
    });

    testEventEmitter.on('error', ({ error }) => {
      errors2.push(error);
    });

    const failingActivityLog = new ActivityLog({
      prisma: failingPrisma,
      eventEmitter: testEventEmitter,
    });

    await failingActivityLog.audit({
      action: LogAction.CREATE,
      entity: LogEntity.CREDENTIAL,
      userId: testUserId,
    });

    // Both listeners should receive the error
    expect(errors1).toHaveLength(1);
    expect(errors2).toHaveLength(1);
  });
});
