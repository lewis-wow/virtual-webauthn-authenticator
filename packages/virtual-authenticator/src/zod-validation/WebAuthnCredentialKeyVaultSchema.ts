import z from 'zod';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { WebAuthnCredentialBaseSchema } from './WebAuthnCredentialBaseSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema =
  WebAuthnCredentialBaseSchema.extend({
    webAuthnPublicKeyCredentialKeyMetaType: z.literal(
      WebAuthnCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaSchema,
  });

export type WebAuthnCredentialKeyVault = z.infer<
  typeof WebAuthnCredentialKeyVaultSchema
>;
