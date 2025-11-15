import { AuthenticatorAssertionResponseSchema } from '../../models/credentials/AuthenticatorAssertionResponseSchema';
import { BytesDtoSchema } from '../common/BytesDtoSchema';
import { UserHandleDtoSchema } from './UserHandleDtoSchema';

export const AuthenticatorAssertionResponseDtoSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesDtoSchema,
    authenticatorData: BytesDtoSchema,
    signature: BytesDtoSchema,
    userHandle: UserHandleDtoSchema.nullable(),
  });
