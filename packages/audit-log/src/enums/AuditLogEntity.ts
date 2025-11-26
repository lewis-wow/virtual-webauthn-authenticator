import type { ValueOfEnum } from '@repo/types';

export const AuditLogEntity = {
  API_KEY: 'API_KEY',
  CREDENTIAL: 'CREDENTIAL',
  WEBAUTHN_CREDENTIAL: 'WEBAUTHN_CREDENTIAL',
} as const;

export type AuditLogEntity = ValueOfEnum<typeof AuditLogEntity>;
