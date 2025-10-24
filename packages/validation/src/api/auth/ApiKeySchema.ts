import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const ApikeySchema = z
  .object({
    id: z.uuid(),
    name: z.string(),
    start: z.string(),
    prefix: z.string(),
    key: z.string(),
    userId: z.string(),
    refillInterval: z.number().int().nullable().optional(),
    refillAmount: z.number().int().nullable().optional(),
    lastRefillAt: IsoDatetimeToDateSchema.nullable().optional(),
    enabled: z.boolean().nullable().optional(),
    rateLimitEnabled: z.boolean().nullable().optional(),
    rateLimitTimeWindow: z.number().int().nullable().optional(),
    rateLimitMax: z.number().int().nullable().optional(),
    requestCount: z.number().int().nullable().optional(),
    remaining: z.number().int().nullable().optional(),
    lastRequest: IsoDatetimeToDateSchema.nullable().optional(),
    expiresAt: IsoDatetimeToDateSchema.nullable().optional(),
    createdAt: IsoDatetimeToDateSchema.optional(),
    updatedAt: IsoDatetimeToDateSchema.optional(),
    permissions: z.string().nullable().optional(),
    metadata: z.string().nullable().optional(),
  })
  .meta({
    ref: 'ApiKey',
    id: 'ApiKey',
  });
