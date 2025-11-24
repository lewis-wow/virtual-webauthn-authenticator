import { AuditSchema } from '@repo/audit-log/validation';
import { Schema } from 'effect';

export const ListAuditLogsResponseSchema = Schema.Array(AuditSchema);
