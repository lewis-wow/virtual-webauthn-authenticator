import z from 'zod';

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
    expiresAt: z.date().optional().nullable(),
    revokedAt: z.date().optional().nullable(),

    permissions: ApiKeyPermissionsSchema.nullish(),
    metadata: ApiKeyMetadataSchema.nullish(),

    // Internal fields
    // lookupKey: z.string(),
    // hashedKey: z.string(),

    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .meta({
    ref: 'ApiKey',
  });

export type ApiKey = z.infer<typeof ApiKeySchema>;
