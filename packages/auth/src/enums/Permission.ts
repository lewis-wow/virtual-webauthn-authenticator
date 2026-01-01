import type { ValueOfEnum } from '@repo/types';

import { PermissionEntity } from './PermissionEntity';

export const Permission = {
  // Credential
  [`${PermissionEntity.Credential}.create` as const]: `${PermissionEntity.Credential}.create`,
  [`${PermissionEntity.Credential}.get` as const]: `${PermissionEntity.Credential}.get`,

  // WebAuthnPublicKeyCredential
  [`${PermissionEntity.WebAuthnPublicKeyCredential}.create` as const]: `${PermissionEntity.WebAuthnPublicKeyCredential}.create`,
  [`${PermissionEntity.WebAuthnPublicKeyCredential}.read` as const]: `${PermissionEntity.WebAuthnPublicKeyCredential}.read`,
  [`${PermissionEntity.WebAuthnPublicKeyCredential}.write` as const]: `${PermissionEntity.WebAuthnPublicKeyCredential}.write`,
  [`${PermissionEntity.WebAuthnPublicKeyCredential}.delete` as const]: `${PermissionEntity.WebAuthnPublicKeyCredential}.delete`,

  // ApiKey
  [`${PermissionEntity.ApiKey}.create` as const]: `${PermissionEntity.ApiKey}.create`,
  [`${PermissionEntity.ApiKey}.read` as const]: `${PermissionEntity.ApiKey}.read`,
  [`${PermissionEntity.ApiKey}.write` as const]: `${PermissionEntity.ApiKey}.write`,
  [`${PermissionEntity.ApiKey}.delete` as const]: `${PermissionEntity.ApiKey}.delete`,
  [`${PermissionEntity.ApiKey}.revoke` as const]: `${PermissionEntity.ApiKey}.revoke`,
} as const;

export type Permission = ValueOfEnum<typeof Permission>;
