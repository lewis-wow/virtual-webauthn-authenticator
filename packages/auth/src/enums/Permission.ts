import type { ValueOfEnum } from '@repo/types';

import { PermissionEntity } from './PermissionEntity';

export const Permission = {
  // Credential
  [`${PermissionEntity.CREDENTIAL}.CREATE` as const]: `${PermissionEntity.CREDENTIAL}.CREATE`,
  [`${PermissionEntity.CREDENTIAL}.GET` as const]: `${PermissionEntity.CREDENTIAL}.GET`,

  // WebAuthnPublicKeyCredential
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.CREATE` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.CREATE`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.READ` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.READ`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.WRITE` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.WRITE`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.DELETE` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.DELETE`,

  // ApiKey
  [`${PermissionEntity.API_KEY}.CREATE` as const]: `${PermissionEntity.API_KEY}.CREATE`,
  [`${PermissionEntity.API_KEY}.READ` as const]: `${PermissionEntity.API_KEY}.READ`,
  [`${PermissionEntity.API_KEY}.WRITE` as const]: `${PermissionEntity.API_KEY}.WRITE`,
  [`${PermissionEntity.API_KEY}.DELETE` as const]: `${PermissionEntity.API_KEY}.DELETE`,
  [`${PermissionEntity.API_KEY}.REVOKE` as const]: `${PermissionEntity.API_KEY}.REVOKE`,
} as const;

export type Permission = ValueOfEnum<typeof Permission>;
