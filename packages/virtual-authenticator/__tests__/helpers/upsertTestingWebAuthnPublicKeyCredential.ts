import { USER_ID } from '../../../auth/__tests__/helpers';
import {
  KEY_VAULT_KEY_ID,
  KEY_VAULT_KEY_NAME,
} from '../../../key-vault/__tests__/helpers';
import { COSEPublicKey } from '../../../keys/__tests__/helpers/COSEPublicKey';

import {
  WebAuthnPublicKeyCredentialKeyMetaType,
  type PrismaClient,
} from '@repo/prisma';

import {
  RP_ID,
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID,
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_KEYVAULT_KEY_META_ID,
} from './consts';

export const upsertTestingWebAuthnPublicKeyCredential = async (opts: {
  prisma: PrismaClient;
}) => {
  const { prisma } = opts;

  return await prisma.webAuthnPublicKeyCredential.upsert({
    where: {
      id: WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID,
    },
    update: {},
    create: {
      id: WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID,
      userId: USER_ID,
      rpId: RP_ID,
      COSEPublicKey: COSEPublicKey.toBytes(),
      webAuthnPublicKeyCredentialKeyMetaType:
        WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
      isClientSideDiscoverable: true,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
        create: {
          id: WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_KEYVAULT_KEY_META_ID,
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
};
