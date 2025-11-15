import { AuthenticatorResponseSchema } from '../../models/credentials/AuthenticatorResponseSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesDtoSchema,
  });
