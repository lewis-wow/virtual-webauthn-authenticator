import type { ValueOfEnum } from '@repo/types';

export const PermissionEntity = {
  Credential: 'Credential',
  WebAuthnCredential: 'WebAuthnCredential',
  ApiKey: 'ApiKey',
} as const;

export type PermissionEntity = ValueOfEnum<typeof PermissionEntity>;
