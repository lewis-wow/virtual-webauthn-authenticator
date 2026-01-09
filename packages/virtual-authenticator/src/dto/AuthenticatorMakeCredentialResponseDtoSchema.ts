import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { AuthenticatorMakeCredentialResponseSchema } from '../validation/authenticator/AuthenticatorMakeCredentialResponseSchema';

export const AuthenticatorMakeCredentialResponseDtoSchema =
  AuthenticatorMakeCredentialResponseSchema.extend({
    attestationObject: BytesSchemaCodec,
    credentialId: BytesSchemaCodec,
  });
