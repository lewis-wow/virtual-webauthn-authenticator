import z from 'zod';

import { IsoDatetimeToDateSchema } from '../../transformers/IsoDatetimeToDateSchema';

export const ApiKeyPermissionsSchema = z.record(
  z.string(),
  z.array(z.string()),
);

export const ApiKeyMetadataSchema = z.record(z.string(), z.unknown());

export const ApiKeySchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    prefix: z.string().nullable(),
    userId: z.string(),
    enabled: z.boolean(),
    expiresAt: IsoDatetimeToDateSchema.optional().nullable(),
    revokedAt: IsoDatetimeToDateSchema.optional().nullable(),

    permissions: ApiKeyPermissionsSchema.nullish(),
    metadata: ApiKeyMetadataSchema.nullish(),

    // Internal fields
    // lookupKey: z.string(),
    // hashedKey: z.string(),

    createdAt: IsoDatetimeToDateSchema,
    updatedAt: IsoDatetimeToDateSchema,
  })
  .meta({
    ref: 'ApiKey',
  });

export type ApiKey = z.infer<typeof ApiKeySchema>;
