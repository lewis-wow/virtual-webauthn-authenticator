import { Schema } from 'effect';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { WebAuthnCredentialBaseSchema } from './WebAuthnCredentialBaseSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialKeyVaultSchema = Schema.extend(
  WebAuthnCredentialBaseSchema,
  Schema.Struct({
    webAuthnCredentialKeyMetaType: Schema.Literal(
      WebAuthnCredentialKeyMetaType.KEY_VAULT,
    ),
    webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMetaSchema,
  }),
);

export type WebAuthnCredentialKeyVault = Schema.Schema.Type<
  typeof WebAuthnCredentialKeyVaultSchema
>;
