import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
