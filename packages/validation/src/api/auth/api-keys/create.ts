import z from 'zod';

import { ApiKeySchema } from '../../../models/auth/ApiKeySchema';

export const CreateApiKeyRequestBodySchema = ApiKeySchema.pick({
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
}).meta({
  ref: 'CreateApiKeyRequestBody',
});

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeySchema,
  plaintextKey: z.string(),
});
