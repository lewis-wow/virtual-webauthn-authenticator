import { Schema } from 'effect';

import { TokenType } from '../enums/TokenType';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';

export const PersonalJwtPayloadSchema = Schema.extend(
  JwtRegisteredClaimsSchema,
  Schema.Struct({
    user: UserSchema.pick('id', 'email', 'name', 'image'),
    tokenType: Schema.Literal(TokenType.PERSONAL),
  }),
).annotations({
  identifier: 'JwtPayload',
});

export type PersonalJwtPayload = Schema.Schema.Type<
  typeof PersonalJwtPayloadSchema
>;
