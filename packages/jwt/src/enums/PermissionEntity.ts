import type { ValueOfEnum } from '@repo/types';

export const PermissionEntity = {
  CREDENTIAL: 'CREDENTIAL',
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL: 'WEB_AUTHN_PUBLIC_KEY_CREDENTIAL',
  VIRTUAL_AUTHENTICATOR: 'VIRTUAL_AUTHENTICATOR',
  API_KEY: 'API_KEY',
} as const;

export type PermissionEntity = ValueOfEnum<typeof PermissionEntity>;
