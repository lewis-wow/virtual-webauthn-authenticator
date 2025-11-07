import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const ApikeySchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    start: z.string().nullable(),
    prefix: z.string().nullable(),
    userId: z.string(),
    enabled: z.boolean(),
    expiresAt: IsoDatetimeToDateSchema.optional().nullable(),
    permissions: z
      .record(z.string(), z.array(z.string()))
      .nullable()
      .optional(),

    createdAt: IsoDatetimeToDateSchema,
    updatedAt: IsoDatetimeToDateSchema,
  })
  .meta({
    ref: 'ApiKey',
  });
