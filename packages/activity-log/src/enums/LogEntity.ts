import type { ValueOfEnum } from '@repo/types';

export const LogEntity = {
  API_KEY: 'API_KEY',
  CREDENTIAL: 'CREDENTIAL',
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL: 'WEB_AUTHN_PUBLIC_KEY_CREDENTIAL',
} as const;

export type LogEntity = ValueOfEnum<typeof LogEntity>;
