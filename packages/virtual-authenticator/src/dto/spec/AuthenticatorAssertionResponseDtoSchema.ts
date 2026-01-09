import { BytesSchemaCodec } from '@repo/core/zod-validation';
import { AuthenticatorAssertionResponseSchema } from '@repo/virtual-authenticator/validation';

import { UserHandleDtoSchema } from './UserHandleDtoSchema';

export const AuthenticatorAssertionResponseDtoSchema =
  AuthenticatorAssertionResponseSchema.extend({
    clientDataJSON: BytesSchemaCodec,
    authenticatorData: BytesSchemaCodec,
    signature: BytesSchemaCodec,
    userHandle: UserHandleDtoSchema.nullable(),
  });
