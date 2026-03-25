import { BytesSchemaCodec } from '@repo/core/validation';
import { AuthenticatorResponseSchema } from '@repo/virtual-authenticator/validation';

/**
 * @see https://www.w3.org/TR/webauthn/#authenticatorresponse
 */
export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
