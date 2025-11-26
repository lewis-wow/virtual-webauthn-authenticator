import { Schema } from 'effect';

import { PermissionSchema } from './enums/PermissionSchema';

export const ApiKeySchema = Schema.Struct({
  id: Schema.UUID,
  name: Schema.NullOr(Schema.String),
  prefix: Schema.NullOr(Schema.String),
  userId: Schema.String,
  enabled: Schema.Boolean,
  start: Schema.NullOr(Schema.String),

  // z.date().optional().nullable() -> Optional field that can be null or a Date (ISO String)
  expiresAt: Schema.optional(Schema.NullOr(Schema.DateFromString)),
  revokedAt: Schema.optional(Schema.NullOr(Schema.DateFromString)),

  permissions: Schema.optional(
    Schema.NullOr(Schema.mutable(Schema.Array(PermissionSchema))),
  ),

  // Internal fields
  // lookupKey: Schema.String,
  // hashedKey: Schema.String,

  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({
  identifier: 'ApiKey',
  title: 'ApiKey',
});

export type ApiKey = Schema.Schema.Type<typeof ApiKeySchema>;
