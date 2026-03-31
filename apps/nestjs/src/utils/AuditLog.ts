import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/zod-validation';

/**
 * Options for logging an activity.
 */
export interface AuditLogOptions {
  activityLog: ActivityLog;
  action: LogAction;
  entity: LogEntity;
  jwtPayload: JwtPayload;
  entityId?: string;
}

/**
 * Helper function to standardize activity logging across controllers.
 * Automatically extracts API key ID based on token type.
 *
 * @param opts - Audit log options
 *
 * @example
 * await auditLog({
 *   activityLog: this.activityLog,
 *   action: LogAction.CREATE,
 *   entity: LogEntity.CREDENTIAL,
 *   entityId: credentialId,
 *   jwtPayload,
 * });
 */
export async function auditLog(opts: AuditLogOptions): Promise<void> {
  const { activityLog, action, entity, entityId, jwtPayload } = opts;

  await activityLog.audit({
    action,
    entity,
    ...(entityId && { entityId }),
    apiKeyId:
      jwtPayload.tokenType === TokenType.API_KEY
        ? jwtPayload.apiKeyId
        : undefined,
    userId: jwtPayload.userId,
  });
}
