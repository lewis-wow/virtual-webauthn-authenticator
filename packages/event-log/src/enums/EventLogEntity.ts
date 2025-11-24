import type { ValueOfEnum } from '@repo/types';

export const EventLogEntity = {
  CREDENTIAL: 'CREDENTIAL',
  WEBAUTHN_CREDENTIAL: 'WEBAUTHN_CREDENTIAL',
} as const;

export type EventLogEntity = ValueOfEnum<typeof EventLogEntity>;
