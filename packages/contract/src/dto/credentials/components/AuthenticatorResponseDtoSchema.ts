import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
