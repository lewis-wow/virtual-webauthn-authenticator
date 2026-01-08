import { BytesSchemaCodec } from '@repo/core/zod-validation';

import { AuthenticatorGetAssertionResponseSchema } from '../validation/AuthenticatorGetAssertionResponseSchema';

export const AuthenticatorGetAssertionResponseDtoSchema =
  AuthenticatorGetAssertionResponseSchema.extend({
    credentialId: BytesSchemaCodec,
    authenticatorData: BytesSchemaCodec,
    signature: BytesSchemaCodec,
    userHandle: BytesSchemaCodec.nullable(),
  });
