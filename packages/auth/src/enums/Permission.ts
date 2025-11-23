import type { ValueOfEnum } from '@repo/types';

import { PermissionEntity } from './PermissionEntity';

export const Permission = {
  // Credential
  [`${PermissionEntity.Credential}.create` as const]: `${PermissionEntity.Credential}.create`,
  [`${PermissionEntity.Credential}.get` as const]: `${PermissionEntity.Credential}.get`,

  // WebAuthnCredential
  [`${PermissionEntity.WebAuthnCredential}.create` as const]: `${PermissionEntity.WebAuthnCredential}.create`,
  [`${PermissionEntity.WebAuthnCredential}.read` as const]: `${PermissionEntity.WebAuthnCredential}.read`,
  [`${PermissionEntity.WebAuthnCredential}.write` as const]: `${PermissionEntity.WebAuthnCredential}.write`,
  [`${PermissionEntity.WebAuthnCredential}.delete` as const]: `${PermissionEntity.WebAuthnCredential}.delete`,

  // ApiKey
  [`${PermissionEntity.ApiKey}.create` as const]: `${PermissionEntity.ApiKey}.create`,
  [`${PermissionEntity.ApiKey}.read` as const]: `${PermissionEntity.ApiKey}.read`,
  [`${PermissionEntity.ApiKey}.write` as const]: `${PermissionEntity.ApiKey}.write`,
  [`${PermissionEntity.ApiKey}.delete` as const]: `${PermissionEntity.ApiKey}.delete`,
  [`${PermissionEntity.ApiKey}.revoke` as const]: `${PermissionEntity.ApiKey}.revoke`,
} as const;

export type Permission = ValueOfEnum<typeof Permission>;
