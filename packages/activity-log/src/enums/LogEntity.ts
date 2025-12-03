import type { ValueOfEnum } from '@repo/types';

export const LogEntity = {
  API_KEY: 'API_KEY',
  CREDENTIAL: 'CREDENTIAL',
  WEBAUTHN_CREDENTIAL: 'WEBAUTHN_CREDENTIAL',
} as const;

export type LogEntity = ValueOfEnum<typeof LogEntity>;
