import { WebAuthnCredentialKeyMetaType } from '@repo/prisma/src/generated/client/enums';
import z from 'zod';

import { Base64urlToBytesSchema } from '../../transformers/Base64urlToBytesSchema';
import { WebAuthnCredentialKeyVaultKeyMetaSchema } from './WebAuthnCredentialKeyVaultKeyMetaSchema';

export const WebAuthnCredentialSchema = z
  .object({
    id: z.uuid(),
    name: z.string().nullable(),
    userId: z.string(),
    COSEPublicKey: Base64urlToBytesSchema,
    webAuthnCredentialKeyMetaType: z.enum(WebAuthnCredentialKeyMetaType),
    webAuthnCredentialKeyVaultKeyMeta: WebAuthnCredentialKeyVaultKeyMetaSchema,
    counter: z.number().int().nonnegative(),
    transports: z.array(z.string()),
    rpId: z.string(),
  })
  .meta({
    id: 'WebAuthnCredential',
    ref: 'WebAuthnCredential',
  });

export type WebAuthnCredential = z.infer<typeof WebAuthnCredentialSchema>;
