import { Schema } from 'effect';

export const WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema = Schema.Struct({
  id: Schema.UUID,
  keyVaultKeyId: Schema.NullOr(Schema.String),
  keyVaultKeyName: Schema.String,
  hsm: Schema.Boolean,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({
  identifier: 'WebAuthnPublicKeyCredentialKeyVaultKeyMeta',
  title: 'WebAuthnPublicKeyCredentialKeyVaultKeyMeta',
  ref: 'WebAuthnPublicKeyCredentialKeyVaultKeyMeta',
});

export type WebAuthnPublicKeyCredentialKeyVaultKeyMeta = Schema.Schema.Type<
  typeof WebAuthnPublicKeyCredentialKeyVaultKeyMetaSchema
>;
