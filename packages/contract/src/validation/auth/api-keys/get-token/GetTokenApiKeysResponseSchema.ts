import { JwtSchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const GetTokenApiKeysResponseSchema = Schema.Struct({
  token: JwtSchema,
}).annotations({
  identifier: 'GetTokenApiKeysResponse',
  title: 'GetTokenApiKeysResponse',
});
