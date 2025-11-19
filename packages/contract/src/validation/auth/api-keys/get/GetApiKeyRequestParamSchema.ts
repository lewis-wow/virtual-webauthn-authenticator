import { ApiKeySchema } from '@repo/auth/validation';

export const GetApiKeyRequestParamSchema = ApiKeySchema.pick('id').annotations({
  identifier: 'GetApiKeyRequestParam',
});
