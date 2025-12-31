import type { ValueOfEnum } from '@repo/types';

export const PermissionEntity = {
  Credential: 'Credential',
  WebAuthnPublicKeyCredential: 'WebAuthnPublicKeyCredential',
  ApiKey: 'ApiKey',
} as const;

export type PermissionEntity = ValueOfEnum<typeof PermissionEntity>;
