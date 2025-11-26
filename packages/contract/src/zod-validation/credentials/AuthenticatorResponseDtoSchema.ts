import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../codecs/BytesSchemaCodec';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
