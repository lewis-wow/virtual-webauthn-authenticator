import z from 'zod';

import { ApiKeySchemaCodec } from '../../../models/auth/ApiKeySchema';

export const CreateApiKeyRequestBodySchema = ApiKeySchemaCodec.pick({
  name: true,
  permissions: true,
  metadata: true,
  expiresAt: true,
  enabled: true,
}).meta({
  ref: 'CreateApiKeyRequestBody',
});

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApiKeySchemaCodec,
  plaintextKey: z.string(),
});
