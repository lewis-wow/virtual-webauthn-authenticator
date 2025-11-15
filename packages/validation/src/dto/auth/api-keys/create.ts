import z from 'zod';

import { ApiKeyDtoSchema } from '../../../_dto/auth/ApiKeyDtoSchema';

export const CreateApiKeyRequestBodySchema = ApiKeyDtoSchema.pick({
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
}).meta({
  ref: 'CreateApiKeyRequestBody',
});

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeyDtoSchema,
  plaintextKey: z.string(),
});
