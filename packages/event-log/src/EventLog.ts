import { PrismaClient, Prisma } from '@repo/prisma';

import type { EventLogAction } from './enums/EventLogAction';
import type { EventLogEntity } from './enums/EventLogEntity';

export type Event = {
  action: EventLogAction;
  entity: EventLogEntity;
  entityId: string | null;

  // Actor details
  user: {
    id: string;
    email: string;
  } | null;
  apiKey: {
    name: string | null;
    prefix: string | null;
    start: string | null;
  } | null;

  // Metadata
  metadata: Record<string, unknown> | null;
};

export type LogArgs = {
  action: EventLogAction;
  entity: EventLogEntity;
  entityId?: string;

  // Actor details
  userId?: string;
  apiKeyId?: string;

  // Metadata
  metadata?: Record<string, unknown> | null;
};

export type HasOccuredArgs = {
  action?: EventLogAction;
  entity?: EventLogEntity;
  entityId?: string;
  userId?: string;
  apiKeyId?: string;
  /**
   * Optional: Check if event occurred after this time.
   * Useful for "Once per day" or "Once per session" logic.
   */
  after?: Date;
};

export type EventLogOptions = {
  prisma: PrismaClient;
};

export class EventLog {
  private prisma: PrismaClient;

  constructor({ prisma }: EventLogOptions) {
    this.prisma = prisma;
  }

  /**
   * Records a new event in the database.
   * Using 'void' return to encourage fire-and-forget usage,
   * though you can await it if strict consistency is required.
   */
  async log(data: LogArgs): Promise<void> {
    const { action, entity, entityId, userId, apiKeyId, metadata } = data;

    try {
      await this.prisma.eventLog.create({
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
   * Checks if an event matching the filters has already occurred.
   * Useful for Idempotency or "Once per X" logic.
   */
  async hasOccurred(filter: HasOccuredArgs): Promise<boolean> {
    const { action, entity, entityId, userId, apiKeyId, after } = filter;

    // We use findFirst instead of count for slightly better performance
    // if we only care about existence (stops scanning after finding one).
    const record = await this.prisma.eventLog.findFirst({
      where: {
        action,
        entity,
        entityId,
        userId,
        apiKeyId,
        createdAt: after ? { gte: after } : undefined,
      },
      select: { id: true }, // Select only ID to minimize data transfer
    });

    return !!record;
  }

  /**
   * specific helper to get the history of a specific object
   * e.g. "Show me history for Order #123"
   */
  async getEntityHistory(opts: {
    entity: EventLogEntity;
    entityId: string;
    limit?: number;
  }): Promise<Event[]> {
    const { entity, entityId, limit = 20 } = opts;

    const events = await this.prisma.eventLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: { email: true, id: true },
        },
        apiKey: {
          select: { name: true, prefix: true, start: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return events as Event[];
  }
}
