import {
  WebAuthnCredentialKeyMetaType,
  type PrismaClient,
  Prisma,
  type WebAuthnCredentialKeyVaultKeyMeta,
} from '@repo/prisma';

import {
  COSEPublicKey,
  RP_ID,
  USER_ID,
  WEBAUTHN_CREDENTIAL_ID,
  WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
} from './consts';

export const upsertTestingWebAuthnCredential = async (opts: {
  prisma: PrismaClient;
}) => {
  const { prisma } = opts;

  // Declare the variable outside the try block
  let webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMeta;

  // --- Fix for the first upsert ---
  try {
    webAuthnCredentialKeyVaultKeyMeta =
      await prisma.webAuthnCredentialKeyVaultKeyMeta.upsert({
        where: {
          id: WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
        },
        update: {},
        create: {
          id: WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
          keyVaultKeyName: '',
        },
      });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      // Race condition: another process created this. Fetch it.
      console.warn(
        `Prisma upsert race condition handled for webAuthnCredentialKeyVaultKeyMeta: ${WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID}`,
      );
      webAuthnCredentialKeyVaultKeyMeta =
        await prisma.webAuthnCredentialKeyVaultKeyMeta.findUniqueOrThrow({
          where: {
            id: WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
          },
        });
    } else {
      // Re-throw any other error
      throw e;
    }
  }

  // --- Fix for the second upsert ---
  try {
    return await prisma.webAuthnCredential.upsert({
      where: {
        id: WEBAUTHN_CREDENTIAL_ID,
      },
      update: {},
      create: {
        id: WEBAUTHN_CREDENTIAL_ID,
        userId: USER_ID,
        rpId: RP_ID,
        COSEPublicKey: COSEPublicKey.toBuffer(),
        webAuthnCredentialKeyMetaType: WebAuthnCredentialKeyMetaType.KEY_VAULT,
        // This ID is now safely populated from the code block above
        webAuthnCredentialKeyVaultKeyMetaId:
          webAuthnCredentialKeyVaultKeyMeta.id,
      },
      include: {
        webAuthnCredentialKeyVaultKeyMeta: true,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      // Race condition: another process created this. Fetch it.
      console.warn(
        `Prisma upsert race condition handled for webAuthnCredential: ${WEBAUTHN_CREDENTIAL_ID}`,
      );
      return await prisma.webAuthnCredential.findUniqueOrThrow({
        where: {
          id: WEBAUTHN_CREDENTIAL_ID,
        },
        include: {
          webAuthnCredentialKeyVaultKeyMeta: true,
        },
      });
    } else {
      // Re-throw any other error
      throw e;
    }
  }
};
