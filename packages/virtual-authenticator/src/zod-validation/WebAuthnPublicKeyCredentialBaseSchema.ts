import z from 'zod';

import { BytesSchema } from './BytesSchema';

export const WebAuthnPublicKeyCredentialBaseSchema = z.object({
  id: z.uuid(),
  name: z.string().nullable(),
  userId: z.string(),
  COSEPublicKey: BytesSchema,
  counter: z.number().int().nonnegative(),
  transports: z.array(z.string()),
  rpId: z.string(),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebAuthnPublicKeyCredentialBase = z.infer<
  typeof WebAuthnPublicKeyCredentialBaseSchema
>;
