import { AuthenticatorAttestationResponseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    attestationObject: BytesSchemaCodec,
  });
