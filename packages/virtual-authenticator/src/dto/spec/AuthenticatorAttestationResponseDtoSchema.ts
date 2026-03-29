import { BytesSchemaCodec } from '@repo/core/validation';
import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/validation';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    attestationObject: BytesSchemaCodec,
  });
