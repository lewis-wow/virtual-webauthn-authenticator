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
    origin: Schema.String,
  }),
});
