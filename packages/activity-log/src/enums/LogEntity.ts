import type { ValueOfEnum } from '@repo/types';

export const LogEntity = {
  API_KEY: 'API_KEY',
  CREDENTIAL: 'CREDENTIAL',
  VIRTUAL_AUTHENTICATOR: 'VIRTUAL_AUTHENTICATOR',
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL: 'WEB_AUTHN_PUBLIC_KEY_CREDENTIAL',
} as const;

export type LogEntity = ValueOfEnum<typeof LogEntity>;
