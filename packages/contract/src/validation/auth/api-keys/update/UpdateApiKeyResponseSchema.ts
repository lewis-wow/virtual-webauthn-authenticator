import { ApiKeySchema } from '@repo/auth/validation';

export const UpdateApiKeyResponseSchema = ApiKeySchema.annotations({
  identifier: 'UpdateApiKeyResponse',
});
