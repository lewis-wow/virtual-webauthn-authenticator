import { AuthenticatorAttestationResponseSchema } from '../../models/credentials/AuthenticatorAttestationResponseSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    attestationObject: BytesSchemaCodec,
  });
