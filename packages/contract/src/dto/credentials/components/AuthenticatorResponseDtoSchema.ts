import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
