import z from 'zod';

import { WebAuthnCredentialKeyVaultSchema } from './WebAuthnCredentialKeyVaultSchema';

export const WebAuthnCredentialSchema = z.discriminatedUnion(
  'webAuthnCredentialKeyMetaType',
  [WebAuthnCredentialKeyVaultSchema],
);

export type WebAuthnCredential = z.infer<typeof WebAuthnCredentialSchema>;
