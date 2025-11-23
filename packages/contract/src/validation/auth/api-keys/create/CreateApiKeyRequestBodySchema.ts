import { ApiKeySchema } from '@repo/auth/validation';
import { DurationSchema } from '@repo/core/validation';
import { Schema } from 'effect';

export const CreateApiKeyRequestBodySchema = Schema.extend(
  ApiKeySchema.pick('name', 'permissions', 'enabled'),
  Schema.Struct({
    expiresAt: Schema.optional(Schema.NullOr(DurationSchema)),
  }),
).annotations({
  identifier: 'CreateApiKeyRequestBody',
});
