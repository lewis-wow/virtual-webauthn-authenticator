import type { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { SortDirection } from '@repo/pagination/enums';
import type { PaginationResult } from '@repo/pagination/zod-validation';
import { PrismaClient, Prisma } from '@repo/prisma';
import type { MakeNullableOptional } from '@repo/types';

import type { LogSortKeys } from './enums/LogSortKeys';
import type { Log } from './zod-validation/LogSchema';

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_SORT_ORDER = SortDirection.DESC;

export type ActivityLogOptions = {
  prisma: PrismaClient;
  logger: Logger;
};

export class ActivityLog {
  private readonly prisma: PrismaClient;
  private readonly logger: Logger;

  constructor(opts: ActivityLogOptions) {
    this.prisma = opts.prisma;
    this.logger = opts.logger;
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
      await this.prisma.log.create({
        data: {
          action,
          entity,
          entityId,
          userId,
          apiKeyId,
          apiKeyIdReference: apiKeyId,
          metadata: metadata
            ? (metadata as Prisma.InputJsonValue)
            : Prisma.DbNull,
        },
      });
    } catch (auditError) {
      // CRITICAL: Never let a logging failure crash the main application flow.
      this.logger.catch(auditError, 'Failed to write event log.');
    }
  }

  /**
   * Retrieves the activity log history for a specific user.
   * @param opts.userId - The user ID to fetch history for
   * @param opts.limit - Maximum number of records to return
   * @param opts.cursor - Pagination cursor
   * @param opts.orderBy - Sort order for results
   * @returns Paginated log results
   */
  async getUserHistory(opts: {
    userId: string;
    limit?: number;
    cursor?: string;
    orderBy?: Record<LogSortKeys, SortDirection>;
  }): Promise<PaginationResult<Log>> {
    const { userId, limit = DEFAULT_HISTORY_LIMIT, cursor, orderBy } = opts;

    const pagination = new Pagination(async ({ pagination }) => {
      const logs = await this.prisma.log.findMany({
        where: {
          userId,
        },
        orderBy: orderBy ?? {
          createdAt: DEFAULT_SORT_ORDER,
        },
        ...pagination,
      });

      return logs as Log[];
    });

    const paginationResult = await pagination.fetch({ limit, cursor });

    return paginationResult;
  }
}
