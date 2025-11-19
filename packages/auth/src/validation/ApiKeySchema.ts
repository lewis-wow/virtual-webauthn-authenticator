import { Schema } from 'effect';

export const ApiKeyPermissionsSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Array(Schema.String),
});

export const ApiKeyMetadataSchema = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
});

export const ApiKeySchema = Schema.Struct({
  id: Schema.UUID,
  name: Schema.NullOr(Schema.String),
  prefix: Schema.NullOr(Schema.String),
  userId: Schema.String,
  enabled: Schema.Boolean,

  // z.date().optional().nullable() -> Optional field that can be null or a Date (ISO String)
  expiresAt: Schema.optional(Schema.NullOr(Schema.DateFromString)),
  revokedAt: Schema.optional(Schema.NullOr(Schema.DateFromString)),

  // z.nullish() -> Optional field that can be null or the type
  permissions: Schema.optional(Schema.NullOr(ApiKeyPermissionsSchema)),
  metadata: Schema.optional(Schema.NullOr(ApiKeyMetadataSchema)),

  // Internal fields
  // lookupKey: Schema.String,
  // hashedKey: Schema.String,

  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({
  identifier: 'ApiKey',
});

export type ApiKey = Schema.Schema.Type<typeof ApiKeySchema>;
