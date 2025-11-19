import { Schema } from 'effect';

export const WebAuthnCredentialKeyVaultKeyMetaSchema = Schema.Struct({
  id: Schema.UUID,
  keyVaultKeyId: Schema.NullOr(Schema.String),
  keyVaultKeyName: Schema.String,
  hsm: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({
  identifier: 'WebAuthnCredentialKeyVaultKeyMeta',
  ref: 'WebAuthnCredentialKeyVaultKeyMeta',
});

export type WebAuthnCredentialKeyVaultKeyMeta = Schema.Schema.Type<
  typeof WebAuthnCredentialKeyVaultKeyMetaSchema
>;
