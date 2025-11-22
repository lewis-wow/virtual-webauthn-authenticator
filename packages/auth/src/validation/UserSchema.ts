import { EmailSchema } from '@repo/core/validation';
import { Schema } from 'effect';

export const UserSchema = Schema.Struct({
  id: Schema.UUID,
  name: Schema.String,
  email: EmailSchema,
  emailVerified: Schema.optionalWith(Schema.Boolean, { default: () => false }),

  image: Schema.NullOr(Schema.String),

  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}).annotations({
  identifier: 'User',
});

export type User = Schema.Schema.Type<typeof UserSchema>;
