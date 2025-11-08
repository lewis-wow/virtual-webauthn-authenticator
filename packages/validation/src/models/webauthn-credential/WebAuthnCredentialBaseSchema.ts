import z from 'zod';

import { Base64urlToBytesCodecSchema } from '../../codecs/Base64urlToBytesCodecSchema';

export const WebAuthnCredentialBaseSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    userId: z.string(),
    COSEPublicKey: Base64urlToBytesCodecSchema,
    counter: z.number().int().nonnegative(),
    transports: z.array(z.string()),
    rpId: z.string(),
  })
  .meta({
    id: 'WebAuthnCredential',
    ref: 'WebAuthnCredential',
  });

export type WebAuthnCredentialBase = z.infer<
  typeof WebAuthnCredentialBaseSchema
>;
