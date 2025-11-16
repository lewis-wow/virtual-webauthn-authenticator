import { AuthenticatorResponseSchema } from '../../models/credentials/AuthenticatorResponseSchema';
import { BytesSchemaCodec } from '../common/BytesSchemaCodec';

export const AuthenticatorResponseDtoSchema =
  AuthenticatorResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
  });
