import z from 'zod';

import { BytesSchemaCodec } from '../../codecs/BytesSchemaCodec';
import { BytesSchema } from '../common/BytesSchema';

export const WebAuthnCredentialBaseSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    userId: z.string(),
    COSEPublicKey: BytesSchema,
    counter: z.number().int().nonnegative(),
    transports: z.array(z.string()),
    rpId: z.string(),
  })
  .meta({
    id: 'WebAuthnCredential',
    ref: 'WebAuthnCredential',
  });

export const WebAuthnCredentialBaseSchemaCodec =
  WebAuthnCredentialBaseSchema.extend({
    COSEPublicKey: BytesSchemaCodec,
  });

export type WebAuthnCredentialBase = z.infer<
  typeof WebAuthnCredentialBaseSchema
>;
