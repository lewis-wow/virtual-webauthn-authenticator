import z from 'zod';

import { BytesSchema } from './BytesSchema';

export const WebAuthnCredentialBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  userId: z.string(),
  COSEPublicKey: BytesSchema,
  counter: z.number().int().nonnegative(),
  transports: z.array(z.string()),
  rpId: z.string(),
});

export type WebAuthnCredentialBase = z.infer<
  typeof WebAuthnCredentialBaseSchema
>;
