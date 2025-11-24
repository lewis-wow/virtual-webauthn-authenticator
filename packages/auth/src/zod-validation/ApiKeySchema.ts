import z from 'zod';

import { PermissionSchema } from './enums/PermissionSchema';

export const ApiKeySchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    prefix: z.string().nullable(),
    userId: z.string(),
    enabled: z.boolean(),
    start: z.string().nullable(),

    expiresAt: z.date().nullable(),
    revokedAt: z.date().nullable(),

    permissions: z.array(PermissionSchema),

    metadata: z.object({
      createdWebAuthnCredentialCount: z.int().nonnegative(),
    }),

    // Internal fields
    // lookupKey: z.string(),
    // hashedKey: z.string(),

    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .meta({
    id: 'ApiKey',
  });

export type ApiKey = z.infer<typeof ApiKeySchema>;
