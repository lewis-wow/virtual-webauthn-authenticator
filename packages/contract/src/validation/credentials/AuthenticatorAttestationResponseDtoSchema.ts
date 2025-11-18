import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/validation';

import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    attestationObject: BytesSchemaCodec,
  });
