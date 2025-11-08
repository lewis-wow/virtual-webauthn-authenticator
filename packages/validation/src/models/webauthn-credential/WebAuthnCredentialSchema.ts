import z from 'zod';

import {
  WebAuthnCredentialKeyVaultSchema,
  WebAuthnCredentialKeyVaultSchemaCodec,
} from './WebAuthnCredentialKeyVaultSchema';

export const WebAuthnCredentialSchema = z.discriminatedUnion(
  'webAuthnCredentialKeyMetaType',
  [WebAuthnCredentialKeyVaultSchema],
);

export const WebAuthnCredentialSchemaCodec = z.discriminatedUnion(
  'webAuthnCredentialKeyMetaType',
  [WebAuthnCredentialKeyVaultSchemaCodec],
);

export type WebAuthnCredential = z.infer<typeof WebAuthnCredentialSchema>;
