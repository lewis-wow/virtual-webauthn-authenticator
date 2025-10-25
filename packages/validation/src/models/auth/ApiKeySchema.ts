import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const ApikeySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    start: z.string(),
    prefix: z.string(),
    keyHash: z.string(),
    userId: z.string(),
    enabled: z.boolean(),
    expiresAt: IsoDatetimeToDateSchema.optional().nullable(),
    permissions: z.string().nullable().optional(),

    createdAt: IsoDatetimeToDateSchema,
    updatedAt: IsoDatetimeToDateSchema,
  })
  .meta({
    ref: 'ApiKey',
  });
