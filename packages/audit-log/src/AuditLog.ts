import { PrismaClient, Prisma } from '@repo/prisma';
import type { MakeNullableOptional } from '@repo/types';

import type { AuditLogEntity } from './enums/AuditLogEntity';
import type { Audit } from './validation/AuditSchema';

export type AuditLogOptions = {
  prisma: PrismaClient;
};

export class AuditLog {
  private prisma: PrismaClient;

  constructor({ prisma }: AuditLogOptions) {
    this.prisma = prisma;
  }

  /**
   * Records a new event in the database.
   * Using 'void' return to encourage fire-and-forget usage,
   * though you can await it if strict consistency is required.
   */
  async audit(data: MakeNullableOptional<Audit>): Promise<void> {
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
    entity: AuditLogEntity;
    entityId: string;
    limit?: number;
  }): Promise<Audit[]> {
    const { entity, entityId, limit = 20 } = opts;

    const audits = await this.prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return audits as Audit[];
  }

  async getUserHistory(opts: {
    userId: string;
    limit?: number;
  }): Promise<Audit[]> {
    const { userId, limit = 20 } = opts;

    const audits = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return audits as Audit[];
  }
}
