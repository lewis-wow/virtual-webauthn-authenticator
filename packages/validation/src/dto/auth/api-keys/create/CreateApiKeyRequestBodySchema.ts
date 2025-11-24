import { ApiKeyDtoSchema } from '../../ApiKeyDtoSchema';

export const CreateApiKeyRequestBodySchema = ApiKeyDtoSchema.pick({
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
}).meta({
  ref: 'CreateApiKeyRequestBody',
});
