import { ApiKeySchema } from '@repo/auth/validation';

export const DeleteApiKeyResponseSchema = ApiKeySchema.annotations({
  identifier: 'DeleteApiKeyResponse',
});
