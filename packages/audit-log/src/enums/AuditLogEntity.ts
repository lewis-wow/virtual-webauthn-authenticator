import type { ValueOfEnum } from '@repo/types';

export const AuditLogEntity = {
  CREDENTIAL: 'CREDENTIAL',
  WEBAUTHN_CREDENTIAL: 'WEBAUTHN_CREDENTIAL',
} as const;

export type AuditLogEntity = ValueOfEnum<typeof AuditLogEntity>;
