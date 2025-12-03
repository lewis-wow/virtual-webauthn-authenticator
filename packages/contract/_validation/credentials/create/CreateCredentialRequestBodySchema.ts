import { OriginSchema } from '@repo/core/validation';
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
    origin: OriginSchema,
  }),
}).annotations({
  identifier: 'CreateCredentialRequestBody',
  title: 'CreateCredentialRequestBody',
  description: 'Request body for creating a new credential.',
});
