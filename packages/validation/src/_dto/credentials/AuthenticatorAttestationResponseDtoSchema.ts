import { AuthenticatorAttestationResponseSchema } from '../../models/credentials/AuthenticatorAttestationResponseSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const AuthenticatorAttestationResponseDtoSchema =
  AuthenticatorAttestationResponseSchema.extend({
    clientDataJSON: BytesDtoSchema,
    attestationObject: BytesDtoSchema,
  });
