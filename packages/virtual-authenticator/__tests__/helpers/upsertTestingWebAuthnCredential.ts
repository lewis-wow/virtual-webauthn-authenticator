import { USER_ID } from '../../../auth/__tests__/helpers';
import {
  KEY_VAULT_KEY_ID,
  KEY_VAULT_KEY_NAME,
} from '../../../key-vault/__tests__/helpers';
import { COSEPublicKey } from '../../../keys/__tests__/helpers/COSEPublicKey';

import {
  WebAuthnCredentialKeyMetaType,
  type PrismaClient,
  Prisma,
} from '@repo/prisma';

import { COSEKeyMapper } from '../../../keys/src/mappers/COSEKeyMapper';
import {
  RP_ID,
  WEBAUTHN_CREDENTIAL_ID,
  WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
} from './consts';

export const upsertTestingWebAuthnCredential = async (opts: {
  prisma: PrismaClient;
}) => {
  const { prisma } = opts;

  try {
    return await prisma.webAuthnPublicKeyCredential.upsert({
      where: {
        id: WEBAUTHN_CREDENTIAL_ID,
      },
      update: {},
      create: {
        id: WEBAUTHN_CREDENTIAL_ID,
        userId: USER_ID,
        rpId: RP_ID,
        COSEPublicKey: COSEKeyMapper.COSEKeyToBytes(COSEPublicKey),
        webAuthnPublicKeyCredentialKeyMetaType:
          WebAuthnCredentialKeyMetaType.KEY_VAULT,
        webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
          create: {
            id: WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID,
            keyVaultKeyName: KEY_VAULT_KEY_NAME,
            keyVaultKeyId: KEY_VAULT_KEY_ID,
            createdAt: new Date(0),
            updatedAt: new Date(0),
          },
        },
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
      include: {
        webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
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
      return await prisma.webAuthnPublicKeyCredential.findUniqueOrThrow({
        where: {
          id: WEBAUTHN_CREDENTIAL_ID,
        },
        include: {
          webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
        },
      });
    } else {
      // Re-throw any other error
      throw e;
    }
  }
};
