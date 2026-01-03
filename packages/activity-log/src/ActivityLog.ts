import { Pagination } from '@repo/pagination';
import { OrderByDirection } from '@repo/pagination/enums';
import type { PaginationResult } from '@repo/pagination/zod-validation';
import { PrismaClient, Prisma } from '@repo/prisma';
import type { MakeNullableOptional, TypedEventEmitter } from '@repo/types';
import type EventEmitter from 'node:events';

import type { LogOrderByKeys } from './enums/LogOrderByKeys';
import type { Log } from './zod-validation/LogSchema';

const DEFAULT_HISTORY_LIMIT = 20;
const DEFAULT_SORT_ORDER = OrderByDirection.DESC;

export type ActivityLogEventMap = {
  error: (opts: { error: unknown }) => void;
};

export type ActivityLogOptions = {
  prisma: PrismaClient;
  eventEmitter: EventEmitter;
};

export class ActivityLog implements TypedEventEmitter<ActivityLogEventMap> {
  private readonly prisma: PrismaClient;
  private readonly eventEmitter: EventEmitter;

  constructor(opts: ActivityLogOptions) {
    this.prisma = opts.prisma;
    this.eventEmitter = opts.eventEmitter;
  }

  on<E extends keyof ActivityLogEventMap>(
    event: E,
    listener: ActivityLogEventMap[E],
  ): this {
    this.eventEmitter.on(event, listener);
    return this;
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
    } catch (error) {
      // CRITICAL: Never let a logging failure crash the main application flow.
      this.eventEmitter.emit('error', { error });
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
    orderBy?: Partial<Record<LogOrderByKeys, OrderByDirection>>;
  }): Promise<PaginationResult<Log>> {
    const { userId, limit = DEFAULT_HISTORY_LIMIT, cursor, orderBy } = opts;

    const pagination = new Pagination(
      async ({ pagination, orderBy: idOrderBy }) => {
        const logs = await this.prisma.log.findMany({
          where: {
            userId,
          },
          orderBy: [
            ...(orderBy ? [orderBy] : [{ createdAt: DEFAULT_SORT_ORDER }]),
            idOrderBy,
          ],
          ...pagination,
          skip: pagination.cursor ? 1 : undefined,
        });

        return logs as Log[];
      },
    );

    const paginationResult = await pagination.fetch({ limit, cursor });

    return paginationResult;
  }
}
