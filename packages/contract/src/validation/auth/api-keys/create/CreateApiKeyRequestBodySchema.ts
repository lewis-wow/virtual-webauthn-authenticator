import { ApiKeySchema } from '@repo/auth/validation';

export const CreateApiKeyRequestBodySchema = ApiKeySchema.pick(
  'name',
  'permissions',
  'metadata',
  'expiresAt',
  'enabled',
).annotations({
  identifier: 'CreateApiKeyRequestBody',
});
