import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

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
