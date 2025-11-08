import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';
import { JsonCodec } from '../../transformers/JsonCodec';

export const ApiKeySchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    prefix: z.string().nullable(),
    userId: z.string(),
    enabled: z.boolean(),
    expiresAt: IsoDatetimeToDateSchema.optional().nullable(),
    revokedAt: IsoDatetimeToDateSchema.optional().nullable(),
    permissions: JsonCodec(z.record(z.string(), z.array(z.string()))).nullish(),
    metadata: JsonCodec(z.record(z.string(), z.unknown())).nullish(),

    createdAt: IsoDatetimeToDateSchema,
    updatedAt: IsoDatetimeToDateSchema,
  })
  .meta({
    ref: 'ApiKey',
  });

export type ApiKey = z.infer<typeof ApiKeySchema>;
