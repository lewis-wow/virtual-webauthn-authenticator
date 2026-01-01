import { Schema } from 'effect';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { WebAuthnPublicKeyCredentialBaseSchema } from './WebAuthnPublicKeyCredentialBaseSchema';
import { WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema } from './WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema';

export const WebAuthnPublicKeyCredentialKeyVaultSchema = Schema.extend(
  WebAuthnPublicKeyCredentialBaseSchema,
  Schema.Struct({
    webAuthnPublicKeyCredentialKeyMetaType: Schema.Literal(
      WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnPublicKeyCredentialKeyVaultKeyMeta:
      WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema,
  }),
);

export type WebAuthnPublicKeyCredentialKeyVault = Schema.Schema.Type<
  typeof WebAuthnPublicKeyCredentialKeyVaultSchema
>;
