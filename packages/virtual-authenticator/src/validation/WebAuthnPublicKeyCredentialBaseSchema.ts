import { Schema } from 'effect';

import { BytesSchema } from './BytesSchema';

export const WebAuthnPublicKeyCredentialBaseSchema = Schema.Struct({
  id: Schema.UUID,
  name: Schema.NullOr(Schema.String),

  userId: Schema.String,
  apiKeyId: Schema.NullOr(Schema.String),

  COSEPublicKey: BytesSchema,
  counter: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  transports: Schema.mutable(Schema.Array(Schema.String)),
  rpId: Schema.String,
}).annotations({
  identifier: 'WebAuthnPublicKeyCredential',
  title: 'WebAuthnPublicKeyCredential',
});

export type WebAuthnPublicKeyCredentialBase = Schema.Schema.Type<
  typeof WebAuthnPublicKeyCredentialBaseSchema
>;
