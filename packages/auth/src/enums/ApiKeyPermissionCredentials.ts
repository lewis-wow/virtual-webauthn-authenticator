import type { ValueOfEnum } from '@repo/types';

export const ApiKeyPermissionCredentials = {
  CREDENTIAL_CREATE: 'CREDENTIAL_CREATE',
  CREDENTIAL_GET: 'CREDENTIAL_GET',
  CREDENTIAL_CREATE_ONCE: 'CREDENTIAL_CREATE_ONCE',
} as const;

export type ApiKeyPermissionCredentials = ValueOfEnum<
  typeof ApiKeyPermissionCredentials
>;
