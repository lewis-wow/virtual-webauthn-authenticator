import {
  CollectedClientDataTypeSchema,
  TokenBindingStatusSchema,
} from '@repo/enums';
import type { ICollectedClientData } from '@repo/types';
import z from 'zod';

export const CollectedClientDataSchema = z
  .object({
    type: CollectedClientDataTypeSchema,
    challenge: z.string(),
    origin: z.string(),
    crossOrigin: z.boolean().optional(),
    tokenBinding: z
      .object({
        status: TokenBindingStatusSchema,
        id: z.string().optional(),
      })
      .optional(),
  })
  .meta({
    description:
      'The client data collected by the authenticator. For more information, see https://www.w3.org/TR/webauthn/#dictdef-collectedclientdata.',
  }) satisfies z.ZodType<ICollectedClientData>;
