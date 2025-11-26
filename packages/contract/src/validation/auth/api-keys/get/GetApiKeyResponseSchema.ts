import { ApiKeySchema } from '@repo/auth/validation';

export const GetApiKeyResponseSchema = ApiKeySchema.annotations({
  identifier: 'GetApiKeyResponse',
  title: 'GetApiKeyResponse',
});
