import { PublicKeyCredentialCreationOptionsSchema } from '@repo/virtual-authenticator/validation';
import { Schema } from 'effect';

export const CreateCredentialRequestBodySchema = Schema.Struct({
  publicKeyCredentialCreationOptions:
    PublicKeyCredentialCreationOptionsSchema.omit(
      /**
       * User is infered from token.
       */
      'user',
    ),
  meta: Schema.Struct({
    origin: Schema.URL,
  }),
}).annotations({
  identifier: 'CreateCredentialRequestBody',
});
