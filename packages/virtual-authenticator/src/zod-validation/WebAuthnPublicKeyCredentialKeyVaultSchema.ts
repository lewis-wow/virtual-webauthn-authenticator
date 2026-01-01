import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { WebAuthnPublicKeyCredentialBaseSchema } from './WebAuthnPublicKeyCredentialBaseSchema';
import { WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema } from './WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema';

export const WebAuthnPublicKeyCredentialKeyVaultSchema =
  WebAuthnPublicKeyCredentialBaseSchema.extend({
    webAuthnPublicKeyCredentialKeyMetaType: z.literal(
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema,
  });

export type WebAuthnPublicKeyCredentialKeyVault = z.infer<
  typeof WebAuthnPublicKeyCredentialKeyVaultSchema
>;
