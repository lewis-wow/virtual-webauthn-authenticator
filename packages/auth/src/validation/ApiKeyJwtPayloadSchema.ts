import { Schema } from 'effect';

import { TokenType } from '../enums/TokenType';
import { ApiKeySchema } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';

export const ApiKeyJwtPayloadSchema = Schema.extend(
  JwtRegisteredClaimsSchema,
  Schema.Struct({
    apiKey: ApiKeySchema.pick('id', 'enabled', 'permissions', 'metadata'),
    user: UserSchema.pick('id', 'email', 'name'),
    tokenType: Schema.Literal(TokenType.API_KEY),
  }),
).annotations({
  identifier: 'JwtPayload',
});

export type ApiKeyJwtPayload = Schema.Schema.Type<
  typeof ApiKeyJwtPayloadSchema
>;
