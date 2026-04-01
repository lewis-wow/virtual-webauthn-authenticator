import { BytesSchemaCodec } from '@repo/validation';
import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/validation';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    attestationObject: BytesSchemaCodec,
  });
