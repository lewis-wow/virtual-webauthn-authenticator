import type { ValueOfEnum } from '@repo/types';

export const ApiKeyPermissionCredentials = {
  CREDENTIAL_CREATE: 'CREDENTIAL_CREATE',
  CREDENTIAL_GET: 'CREDENTIAL_GET',
  CREDENTIAL_CREATE_ONCE: 'CREDENTIAL_CREATE_ONCE',
  CREDENTIAL_GET_CREATED_ONLY: 'CREDENTIAL_GET_CREATED_ONLY',
} as const;

export type ApiKeyPermissionCredentials = ValueOfEnum<
  typeof ApiKeyPermissionCredentials
>;
