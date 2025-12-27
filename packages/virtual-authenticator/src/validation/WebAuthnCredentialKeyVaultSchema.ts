import { Schema } from 'effect';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { WebAuthnCredentialBaseSchema } from './WebAuthnCredentialBaseSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema = Schema.extend(
  WebAuthnCredentialBaseSchema,
  Schema.Struct({
    webAuthnPublicKeyCredentialKeyMetaType: Schema.Literal(
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnCredentialKeyVaultKeyMetaSchema,
  }),
);

export type WebAuthnCredentialKeyVault = Schema.Schema.Type<
  typeof WebAuthnCredentialKeyVaultSchema
>;
