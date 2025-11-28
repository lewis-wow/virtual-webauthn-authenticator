import { Pagination } from '@repo/pagination';
import type { PaginationResult } from '@repo/pagination/zod-validation';
import { PrismaClient, Prisma } from '@repo/prisma';
import type { MakeNullableOptional } from '@repo/types';

import type { LogEntity } from './enums/LogEntity';
import type { Log } from './zod-validation/LogSchema';

export type ActivityLogOptions = {
  prisma: PrismaClient;
};

export class ActivityLog {
  private prisma: PrismaClient;

  constructor({ prisma }: ActivityLogOptions) {
    this.prisma = prisma;
  }

  /**
   * Records a new event in the database.
   * Using 'void' return to encourage fire-and-forget usage,
   * though you can await it if strict consistency is required.
   */
  async audit(
    data: Omit<MakeNullableOptional<Log>, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<void> {
    const { action, entity, entityId, userId, apiKeyId, metadata } = data;

    try {
      await this.prisma.auditLog.create({
        data: {
          action,
          entity,
          entityId,
          userId,
          apiKeyId,
          metadata: metadata
            ? (metadata as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
      });
    } catch (error) {
      // CRITICAL: Never let a logging failure crash the main application flow.
      // In production, you might send this specific error to Sentry/Datadog.
      console.error('Failed to write event log:', error);
    }
  }

  /**
   * specific helper to get the history of a specific object
   * e.g. "Show me history for Order #123"
   */
  async getEntityHistory(opts: {
    entity: LogEntity;
    entityId: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginationResult<Log>> {
    const { entity, entityId, limit = 20, cursor } = opts;

    const pagination = new Pagination(async ({ pagination }) => {
      const logs = await this.prisma.auditLog.findMany({
        where: {
          entity,
          entityId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        ...pagination,
      });

      return logs as Log[];
    });

    const result = await pagination.fetch({ cursor, limit });

    return result;
  }

  async getUserHistory(opts: {
    userId: string;
    limit?: number;
    cursor?: string;
  }): Promise<PaginationResult<Log>> {
    const { userId, limit = 20, cursor } = opts;

    const pagination = new Pagination(async ({ pagination }) => {
      const logs = await this.prisma.auditLog.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        ...pagination,
      });

      return logs as Log[];
    });

    const result = await pagination.fetch({ limit, cursor });

    return result;
  }
}
