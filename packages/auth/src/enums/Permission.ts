import type { ValueOfEnum } from '@repo/types';

import { PermissionEntity } from './PermissionEntity';

export const Permission = {
  // WebAuthnPublicKeyCredential
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.REGISTRATION` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.REGISTRATION`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.ASSERTION` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.ASSERTION`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.LIST` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.LIST`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.GET` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.GET`,
  [`${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.DELETE` as const]: `${PermissionEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL}.DELETE`,

  // VirtualAuthenticator
  [`${PermissionEntity.VIRTUAL_AUTHENTICATOR}.CREATE` as const]: `${PermissionEntity.VIRTUAL_AUTHENTICATOR}.CREATE`,
  [`${PermissionEntity.VIRTUAL_AUTHENTICATOR}.READ` as const]: `${PermissionEntity.VIRTUAL_AUTHENTICATOR}.READ`,
  [`${PermissionEntity.VIRTUAL_AUTHENTICATOR}.WRITE` as const]: `${PermissionEntity.VIRTUAL_AUTHENTICATOR}.WRITE`,
  [`${PermissionEntity.VIRTUAL_AUTHENTICATOR}.DELETE` as const]: `${PermissionEntity.VIRTUAL_AUTHENTICATOR}.DELETE`,

  // ApiKey
  [`${PermissionEntity.API_KEY}.CREATE` as const]: `${PermissionEntity.API_KEY}.CREATE`,
  [`${PermissionEntity.API_KEY}.READ` as const]: `${PermissionEntity.API_KEY}.READ`,
  [`${PermissionEntity.API_KEY}.WRITE` as const]: `${PermissionEntity.API_KEY}.WRITE`,
  [`${PermissionEntity.API_KEY}.DELETE` as const]: `${PermissionEntity.API_KEY}.DELETE`,
  [`${PermissionEntity.API_KEY}.REVOKE` as const]: `${PermissionEntity.API_KEY}.REVOKE`,
} as const;

export type Permission = ValueOfEnum<typeof Permission>;
