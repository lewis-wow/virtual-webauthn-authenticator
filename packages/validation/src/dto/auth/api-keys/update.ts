import { ApiKeyDtoSchema } from '../../../_dto/auth/ApiKeyDtoSchema';
import { GetApiKeyRequestParamSchema } from './get';

export const UpdateApiKeyRequestParamSchema = GetApiKeyRequestParamSchema.meta({
  ref: 'UpdateApiKeyRequestParam',
});

export const UpdateApiKeyRequestBodySchema = ApiKeyDtoSchema.pick({
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

export const UpdateApiKeyResponseSchema = ApiKeyDtoSchema;
