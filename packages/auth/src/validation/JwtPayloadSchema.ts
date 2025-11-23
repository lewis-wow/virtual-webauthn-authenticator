import { Schema } from 'effect';

import { TokenType } from '../enums/TokenType';
import { ApiKeySchema } from './ApiKeySchema';
import { JwtRegisteredClaimsSchema } from './JwtRegisteredClaimsSchema';
import { UserSchema } from './UserSchema';
import { PermissionSchema } from './enums/PermissionSchema';

export const JwtPayloadSchema = Schema.extend(
  JwtRegisteredClaimsSchema,
  Schema.extend(
    Schema.Struct({
      userId: UserSchema.fields.id,
      name: UserSchema.fields.name,
      email: UserSchema.fields.email,
      image: UserSchema.fields.image,
      permissions: Schema.optional(
        Schema.NullOr(Schema.mutable(Schema.Array(PermissionSchema))),
      ),
    }),
    Schema.Union(
      Schema.Struct({
        tokenType: Schema.Literal(TokenType.USER),
      }),
      Schema.Struct({
        tokenType: Schema.Literal(TokenType.API_KEY),
        apiKeyId: ApiKeySchema.fields.id,
      }),
    ),
  ),
);

export type JwtPayload = Schema.Schema.Type<typeof JwtPayloadSchema>;
