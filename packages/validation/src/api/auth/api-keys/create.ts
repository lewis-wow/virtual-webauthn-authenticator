import z from 'zod';

import { ApikeySchema } from '../../../models';

export const CreateApiKeyRequestBodySchema = z
  .object({
    name: z.string(),
  })
  .meta({
    ref: 'CreateApiKeyRequestBody',
  });

export const CreateApiKeyResponseSchema = z.object({
  apiKey: ApikeySchema.omit({ keyHash: true }),
  fullKey: z.string(),
});
