import { ApiKeySchema } from '@repo/auth/validation';

export const UpdateApiKeyRequestParamSchema = ApiKeySchema.pick(
  'id',
).annotations({
  identifier: 'UpdateApiKeyRequestParam',
});
