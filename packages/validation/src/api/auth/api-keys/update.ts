import { ApiKeySchema } from '../../../models/auth/ApiKeySchema';
import { GetApiKeyRequestParamSchema } from './get';

export const UpdateApiKeyRequestParamSchema = GetApiKeyRequestParamSchema.meta({
  ref: 'UpdateApiKeyRequestParam',
});

export const UpdateApiKeyRequestBodySchema = ApiKeySchema.pick({
  name: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
  revokedAt: true,
})
  .partial()
  .meta({
    ref: 'UpdateApiKeyRequestBody',
  });

export const UpdateApiKeyResponseSchema = ApiKeySchema;
