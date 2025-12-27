import type { WebAuthnCredential } from '@repo/virtual-authenticator/zod-validation';

/**
 * Maps a Prisma WebAuthnPublicKeyCredential model to the API WebAuthnCredential type.
 * This is necessary because the Prisma schema uses `webAuthnPublicKeyCredential` prefix
 * while the API contract uses `webAuthnCredential` prefix.
 */
export function mapPrismaWebAuthnToApi(
  prismaCredential: any,
): WebAuthnCredential {
  return {
    ...prismaCredential,
    webAuthnCredentialKeyMetaType:
      prismaCredential.webAuthnPublicKeyCredentialKeyMetaType,
    webAuthnCredentialKeyVaultKeyMeta:
      prismaCredential.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
    webAuthnPublicKeyCredentialKeyMetaType: undefined,
    webAuthnPublicKeyCredentialKeyVaultKeyMeta: undefined,
  } as WebAuthnCredential;
}
