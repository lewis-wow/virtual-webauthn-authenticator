import z from 'zod';

import { ApikeySchema } from '../../../models/auth/ApiKeySchema';

export const GetApiKeyRequestParamSchema = z
  .object({
    id: z.uuid(),
  })
  .meta({
    ref: 'GetApiKeyRequestParam',
  });

export const GetApiKeyResponseSchema = ApikeySchema.omit({ keyHash: true });
