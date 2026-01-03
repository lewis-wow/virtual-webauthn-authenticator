import { OrderByDirection } from '@repo/pagination/enums';
import { PrismaClient } from '@repo/prisma';
import EventEmitter from 'node:events';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { ActivityLog } from '../../../src/ActivityLog';
import { LogAction } from '../../../src/enums/LogAction';
import { LogEntity } from '../../../src/enums/LogEntity';
import { LogOrderByKeys } from '../../../src/enums/LogOrderByKeys';

/**
 * Integration tests for ActivityLog.getUserHistory() method with Prisma ORM
 *
 * These tests verify that the ActivityLog class correctly handles:
 * - Fetching user history with pagination
 * - Cursor-based pagination
 * - Limit enforcement
 * - Custom sorting
 * - Edge cases (no history, single entry, etc.)
 */
describe('ActivityLog.getUserHistory() with Prisma', () => {
  const prisma = new PrismaClient();
  const eventEmitter = new EventEmitter();

  const activityLog = new ActivityLog({
    prisma,
    eventEmitter,
  });

  let testUserId: string;
  let otherUserId: string;
  const createdLogIds: string[] = [];

  beforeAll(async () => {
    // Create test users
    const [user1, user2] = await prisma.$transaction([
      prisma.user.create({
        data: {
          email: 'activity-log-history-test@example.com',
          name: 'Activity Log History Test User',
        },
      }),
      prisma.user.create({
        data: {
          email: 'activity-log-other-user@example.com',
          name: 'Other User',
        },
      }),
    ]);

    testUserId = user1.id;
    otherUserId = user2.id;

    // Create 15 log entries for the test user
    const logs = await prisma.$transaction(
      Array.from({ length: 15 }).map((_, i) =>
        prisma.log.create({
          data: {
            action:
              i % 3 === 0
                ? LogAction.CREATE
                : i % 3 === 1
                  ? LogAction.UPDATE
                  : LogAction.DELETE,
            entity: i % 2 === 0 ? LogEntity.CREDENTIAL : LogEntity.API_KEY,
            entityId: `${i}00e4567-e89b-12d3-a456-426614174000`,
            userId: testUserId,
            metadata: {
              index: i,
              timestamp: Date.now(),
            },
          },
        }),
      ),
    );

    createdLogIds.push(...logs.map((log) => log.id));

    // Create 5 log entries for the other user (to verify filtering)
    const otherLogs = await prisma.$transaction(
      Array.from({ length: 5 }).map(() =>
        prisma.log.create({
          data: {
            action: LogAction.CREATE,
            entity: LogEntity.CREDENTIAL,
            userId: otherUserId,
            entityId: null,
            apiKeyId: null,
            metadata: {},
          },
        }),
      ),
    );

    createdLogIds.push(...otherLogs.map((log) => log.id));
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

    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testUserId, otherUserId],
        },
      },
    });
  });

  test('Should fetch first page with default limit', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
    });

    expect(result.data).toHaveLength(15);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();

    // Verify all logs belong to the test user
    result.data.forEach((log) => {
      expect(log.userId).toBe(testUserId);
    });
  });

  test('Should fetch first page with custom limit', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
    });

    expect(result.data).toHaveLength(5);
    expect(result.meta.hasNext).toBe(true);
    expect(result.meta.nextCursor).toBeTruthy();

    // Verify all logs belong to the test user
    result.data.forEach((log) => {
      expect(log.userId).toBe(testUserId);
    });
  });

  test('Should fetch second page using cursor', async () => {
    // Get first page
    const firstPage = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
    });

    expect(firstPage.meta.nextCursor).toBeTruthy();

    // Fetch second page
    const secondPage = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
      cursor: firstPage.meta.nextCursor!,
    });

    expect(secondPage.data).toHaveLength(5);
    expect(secondPage.meta.hasNext).toBe(true);

    // Verify no overlap between pages
    const firstPageIds = new Set(firstPage.data.map((log) => log.id));
    secondPage.data.forEach((log) => {
      expect(firstPageIds.has(log.id)).toBe(false);
    });
  });

  test('Should fetch last page with no next cursor', async () => {
    // Navigate to last page
    const firstPage = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
    });

    const secondPage = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
      cursor: firstPage.meta.nextCursor!,
    });

    const thirdPage = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 5,
      cursor: secondPage.meta.nextCursor!,
    });

    // Third page should have remaining 3 items (total 15: 5 + 5 + 3 + 2)
    expect(thirdPage.data).toHaveLength(3);
    expect(thirdPage.meta.hasNext).toBe(false);
    expect(thirdPage.meta.nextCursor).toBeNull();
  });

  test('Should respect custom ordering (ascending)', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 10,
      orderBy: {
        [LogOrderByKeys.CREATED_AT]: OrderByDirection.ASC,
      },
    });

    expect(result.data).toHaveLength(10);

    // Verify ascending order
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i]!.createdAt.getTime()).toBeGreaterThanOrEqual(
        result.data[i - 1]!.createdAt.getTime(),
      );
    }
  });

  test('Should respect custom ordering (descending)', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 10,
      orderBy: {
        [LogOrderByKeys.CREATED_AT]: OrderByDirection.DESC,
      },
    });

    expect(result.data).toHaveLength(10);

    // Verify descending order
    for (let i = 1; i < result.data.length; i++) {
      expect(result.data[i]!.createdAt.getTime()).toBeLessThanOrEqual(
        result.data[i - 1]!.createdAt.getTime(),
      );
    }
  });

  test('Should return empty result for user with no history', async () => {
    const newUser = await prisma.user.create({
      data: {
        email: 'no-history@example.com',
        name: 'No History User',
      },
    });

    const result = await activityLog.getUserHistory({
      userId: newUser.id,
    });

    expect(result.data).toHaveLength(0);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();

    // Clean up
    await prisma.user.delete({
      where: {
        id: newUser.id,
      },
    });
  });

  test('Should only return logs for specified user', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 20,
    });

    // Should get all 15 logs for testUserId, not the 5 logs from otherUserId
    expect(result.data).toHaveLength(15);

    // Verify all logs belong to testUserId
    result.data.forEach((log) => {
      expect(log.userId).toBe(testUserId);
    });
  });

  test('Should handle single log entry', async () => {
    const singleUser = await prisma.user.create({
      data: {
        email: 'single-log@example.com',
        name: 'Single Log User',
      },
    });

    const singleLog = await prisma.log.create({
      data: {
        action: LogAction.CREATE,
        entity: LogEntity.CREDENTIAL,
        userId: singleUser.id,
        entityId: null,
        apiKeyId: null,
        metadata: {},
      },
    });

    const result = await activityLog.getUserHistory({
      userId: singleUser.id,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0]!.id).toBe(singleLog.id);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();

    // Clean up
    await prisma.log.delete({
      where: {
        id: singleLog.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: singleUser.id,
      },
    });
  });

  test('Should handle limit larger than total entries', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 100,
    });

    expect(result.data).toHaveLength(15);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });

  test('Should preserve metadata in fetched logs', async () => {
    const result = await activityLog.getUserHistory({
      userId: testUserId,
      limit: 15,
    });

    // Find logs with metadata
    const logsWithMetadata = result.data.filter((log) => log.metadata !== null);

    expect(logsWithMetadata.length).toBeGreaterThan(0);

    logsWithMetadata.forEach((log) => {
      expect(log.metadata).toHaveProperty('index');
      expect(log.metadata).toHaveProperty('timestamp');
      expect(typeof log.metadata!.index).toBe('number');
    });
  });
});
