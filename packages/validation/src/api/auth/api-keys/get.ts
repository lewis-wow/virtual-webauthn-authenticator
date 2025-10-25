import z from 'zod';

import { ApikeySchema } from '../../../models';

export const GetApiKeyRequestParamSchema = z
  .object({
    id: z.uuid(),
  })
  .meta({
    ref: 'GetApiKeyRequestParam',
  });

export const GetApiKeyResponseSchema = ApikeySchema.omit({ key: true });
