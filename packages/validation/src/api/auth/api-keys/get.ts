import z from 'zod';

import { ApiKeySchema } from '../../../models/auth/ApiKeySchema';

export const GetApiKeyRequestParamSchema = z
  .object({
    id: z.uuid(),
  })
  .meta({
    ref: 'GetApiKeyRequestParam',
  });

export const GetApiKeyResponseSchema = ApiKeySchema;
