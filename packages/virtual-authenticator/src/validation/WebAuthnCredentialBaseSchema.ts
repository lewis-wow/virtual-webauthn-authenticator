import { Schema } from 'effect';

import { BytesSchema } from './BytesSchema';

export const WebAuthnCredentialBaseSchema = Schema.Struct({
  id: Schema.UUID,
  name: Schema.NullOr(Schema.String),

  userId: Schema.String,
  apiKeyId: Schema.NullOr(Schema.String),

  COSEPublicKey: BytesSchema,
  counter: Schema.Number.pipe(Schema.int(), Schema.nonNegative()),
  transports: Schema.mutable(Schema.Array(Schema.String)),
  rpId: Schema.String,
}).annotations({
  identifier: 'WebAuthnCredential',
});

export type WebAuthnCredentialBase = Schema.Schema.Type<
  typeof WebAuthnCredentialBaseSchema
>;
