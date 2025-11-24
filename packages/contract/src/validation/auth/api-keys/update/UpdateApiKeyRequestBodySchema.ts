import { ApiKeySchema } from '@repo/auth/validation';
import { Schema } from 'effect';

export const UpdateApiKeyRequestBodySchema = Schema.partial(
  ApiKeySchema.pick('name', 'expiresAt', 'enabled', 'revokedAt'),
).annotations({
  identifier: 'UpdateApiKeyRequestBody',
  title: 'UpdateApiKeyRequestBody',
});
