import { AuthenticatorAssertionResponseSchema } from '../../models/credentials/AuthenticatorAssertionResponseSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';
import { UserHandleDtoSchema } from './UserHandleDtoSchema';

export const AuthenticatorAssertionResponseDtoSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    authenticatorData: BytesSchemaCodec,
    signature: BytesSchemaCodec,
    userHandle: UserHandleDtoSchema.nullable(),
  });
