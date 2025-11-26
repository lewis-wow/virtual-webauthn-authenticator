import { ApiKeySchema } from '@repo/auth/validation';

export const DeleteApiKeyRequestParamSchema = ApiKeySchema.pick(
  'id',
).annotations({
  identifier: 'DeleteApiKeyRequestParam',
  title: 'DeleteApiKeyRequestParam',
});
