import type { ICollectedClientData } from '@repo/types';
import z from 'zod';

export const CollectedClientDataSchema = z.object({
  type: z.union([z.literal('webauthn.create'), z.literal('webauthn.get')]),
  challenge: z.string(),
  origin: z.string(),
  crossOrigin: z.boolean().optional(),
  tokenBinding: z
    .object({
      status: z.union([z.literal('present'), z.literal('supported')]),
      id: z.string().optional(),
    })
    .optional(),
}).meta({
  description: 'The client data collected by the authenticator.',
}) satisfies z.ZodType<ICollectedClientData>;
