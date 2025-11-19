import { Schema } from 'effect';

import { WebAuthnCredentialKeyVaultSchema } from './WebAuthnCredentialKeyVaultSchema';

export const WebAuthnCredentialSchema = Schema.Union(
  WebAuthnCredentialKeyVaultSchema,
);

export type WebAuthnCredential = Schema.Schema.Type<
  typeof WebAuthnCredentialSchema
>;
