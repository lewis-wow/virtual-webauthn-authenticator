import { AuthenticatorAssertionResponseSchema } from '@repo/virtual-authenticator/zod-validation';

import { BytesSchemaCodec } from '../codecs/BytesSchemaCodec';
import { UserHandleDtoSchema } from './UserHandleDtoSchema';

export const AuthenticatorAssertionResponseDtoSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    authenticatorData: BytesSchemaCodec,
    signature: BytesSchemaCodec,
    userHandle: UserHandleDtoSchema.nullable(),
  });
