import { OriginSchema } from '@repo/core/validation';
import { PublicKeyCredentialRequestOptionsSchema } from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';

export const GetCredentialRequestBodySchema = Schema.Struct({
  publicKeyCredentialRequestOptions: Schema.extend(
    PublicKeyCredentialRequestOptionsSchema.omit('rpId'),
    Schema.Struct({
      rpId: Schema.String,
    }),
  ),
  meta: Schema.Struct({
    origin: OriginSchema,
  }),
}).annotations({
  identifier: 'GetCredentialRequestBody',
  title: 'GetCredentialRequestBody',
  description: 'Request body for getting a credential.',
});
