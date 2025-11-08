import z from 'zod';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';

export const WebAuthnCredentialBaseSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    userId: z.string(),
    COSEPublicKey: BytesSchemaCodec,
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
