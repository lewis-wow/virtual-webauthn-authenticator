import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { WebAuthnCredentialBaseSchema } from './WebAuthnCredentialBaseSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema =
  WebAuthnCredentialBaseSchema.extend({
    webAuthnPublicKeyCredentialKeyMetaType: z.literal(
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaSchema,
  });

export type WebAuthnCredentialKeyVault = z.infer<
  typeof WebAuthnCredentialKeyVaultSchema
>;
