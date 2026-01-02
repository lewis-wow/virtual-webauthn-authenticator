import { PrismaClient, type User } from '@repo/prisma';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { Pagination } from '../../../src/Pagination';

/**
 * Integration tests for Pagination.fetch() method with Prisma ORM
 *
 * These tests verify that the Pagination class correctly handles:
 * - Cursor-based pagination
 * - Limit enforcement
 * - Next cursor generation
 * - Edge cases (empty results, single item, etc.)
 */
describe('Pagination.fetch() with Prisma', () => {
  const prisma = new PrismaClient();
  let createdUsers: User[] = [];

  beforeAll(async () => {
    createdUsers = await prisma.$transaction(
      Array.from({ length: 10 }).map((_, i) =>
        prisma.user.create({
          data: {
            email: `john.doe_${i}@email.com`,
            name: `John Doe ${i}`,
          },
        }),
      ),
    );

    // Sort by id ascending to match pagination order
    createdUsers.sort((a, b) => a.id.localeCompare(b.id));
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: createdUsers.map((u) => u.id),
        },
      },
    });
  });

  test('Should fetch first page with limit', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    const result = await pagination.fetch({ limit: 3 });

    expect(result.data).toHaveLength(3);
    expect(result.meta.hasNext).toBe(true);
    expect(result.meta.nextCursor).toBeTruthy();
    expect(result.data[0]!.id).toBe(createdUsers[0]!.id);
    expect(result.data[1]!.id).toBe(createdUsers[1]!.id);
    expect(result.data[2]!.id).toBe(createdUsers[2]!.id);
  });

  test('Should fetch second page using cursor', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    // Get first page to obtain cursor
    const firstPage = await pagination.fetch({ limit: 3 });
    expect(firstPage.meta.nextCursor).toBeTruthy();

    // Fetch second page using cursor
    const secondPage = await pagination.fetch({
      limit: 3,
      cursor: firstPage.meta.nextCursor!,
    });

    expect(secondPage.data).toHaveLength(3);
    expect(secondPage.meta.hasNext).toBe(true);
    expect(secondPage.data[0]!.id).toBe(createdUsers[3]!.id);
    expect(secondPage.data[1]!.id).toBe(createdUsers[4]!.id);
    expect(secondPage.data[2]!.id).toBe(createdUsers[5]!.id);
  });

  test('Should fetch last page with no next cursor', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    // Navigate to last page by getting cursor from second-to-last page
    const firstPage = await pagination.fetch({ limit: 3 });
    const secondPage = await pagination.fetch({
      limit: 3,
      cursor: firstPage.meta.nextCursor!,
    });
    const thirdPage = await pagination.fetch({
      limit: 3,
      cursor: secondPage.meta.nextCursor!,
    });

    // Third page should have 3 items (items 6, 7, 8)
    expect(thirdPage.data).toHaveLength(3);
    expect(thirdPage.meta.hasNext).toBe(true);
    expect(thirdPage.data[0]!.id).toBe(createdUsers[6]!.id);
    expect(thirdPage.data[1]!.id).toBe(createdUsers[7]!.id);
    expect(thirdPage.data[2]!.id).toBe(createdUsers[8]!.id);

    // Fetch the actual last page
    const fourthPage = await pagination.fetch({
      limit: 3,
      cursor: thirdPage.meta.nextCursor!,
    });

    // Last page should have 1 item (item 9)
    expect(fourthPage.data).toHaveLength(1);
    expect(fourthPage.meta.hasNext).toBe(false);
    expect(fourthPage.meta.nextCursor).toBeNull();
    expect(fourthPage.data[0]!.id).toBe(createdUsers[9]!.id);
  });

  test('Should handle fetch without limit', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    const result = await pagination.fetch({});

    // Should return all items when no limit specified
    expect(result.data.length).toBe(10);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });

  test('Should handle empty results', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: 'non-existent-id',
        },
      });
    });

    const result = await pagination.fetch({ limit: 10 });

    expect(result.data).toHaveLength(0);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });

  test('Should handle limit larger than total items', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    const result = await pagination.fetch({ limit: 100 });

    expect(result.data).toHaveLength(10);
    expect(result.meta.hasNext).toBe(false);
    expect(result.meta.nextCursor).toBeNull();
  });

  test('Should handle limit of 1', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    const result = await pagination.fetch({ limit: 1 });

    expect(result.data).toHaveLength(1);
    expect(result.meta.hasNext).toBe(true);
    expect(result.meta.nextCursor).toBeTruthy();
    expect(result.data[0]!.id).toBe(createdUsers[0]!.id);
  });

  test('Should paginate with different page sizes', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    // First page with 4 items
    const firstPage = await pagination.fetch({ limit: 4 });
    expect(firstPage.data).toHaveLength(4);
    expect(firstPage.meta.hasNext).toBe(true);
    expect(firstPage.data[0]!.id).toBe(createdUsers[0]!.id);
    expect(firstPage.data[3]!.id).toBe(createdUsers[3]!.id);

    // Second page with 4 items (should have 4 items: 4, 5, 6, 7)
    const secondPage = await pagination.fetch({
      limit: 4,
      cursor: firstPage.meta.nextCursor!,
    });
    expect(secondPage.data).toHaveLength(4);
    expect(secondPage.meta.hasNext).toBe(true);
    expect(secondPage.data[0]!.id).toBe(createdUsers[4]!.id);
    expect(secondPage.data[3]!.id).toBe(createdUsers[7]!.id);

    // Third page should have 2 items (8, 9)
    const thirdPage = await pagination.fetch({
      limit: 4,
      cursor: secondPage.meta.nextCursor!,
    });
    expect(thirdPage.data).toHaveLength(2);
    expect(thirdPage.meta.hasNext).toBe(false);
    expect(thirdPage.meta.nextCursor).toBeNull();
    expect(thirdPage.data[0]!.id).toBe(createdUsers[8]!.id);
    expect(thirdPage.data[1]!.id).toBe(createdUsers[9]!.id);
  });

  test('Should verify cursor continuity across pages', async () => {
    const pagination = new Pagination(async (opts) => {
      return prisma.user.findMany({
        take: opts.pagination.take,
        cursor: opts.pagination.cursor,
        orderBy: opts.orderBy,
        where: {
          id: {
            in: createdUsers.map((u) => u.id),
          },
        },
      });
    });

    const allPages = [];
    let cursor: string | undefined = undefined;

    // Fetch all pages
    while (true) {
      const page = await pagination.fetch({ limit: 2, cursor });
      allPages.push(...page.data);

      if (!page.meta.hasNext) break;
      cursor = page.meta.nextCursor!;
    }

    // Should have fetched all 10 users
    expect(allPages).toHaveLength(10);

    // Verify all users are unique
    const uniqueIds = new Set(allPages.map((u) => u.id));
    expect(uniqueIds.size).toBe(10);

    // Verify order is maintained (sorted by id ascending)
    for (let i = 0; i < allPages.length - 1; i++) {
      expect(allPages[i]!.id.localeCompare(allPages[i + 1]!.id)).toBeLessThan(
        0,
      );
    }
  });
});
