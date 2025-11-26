import type { ValueOfEnum } from '@repo/types';

export const AuditLogAction = {
  CREATE: 'CREATE',
  GET: 'GET',
  LIST: 'LIST',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
} as const;

export type AuditLogAction = ValueOfEnum<typeof AuditLogAction>;
