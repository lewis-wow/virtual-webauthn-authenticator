import { Schema } from 'effect';

import { WebAuthnPublicKeyCredentialKeyVaultSchema } from './WebAuthnPublicKeyCredentialKeyVaultSchema';

export const WebAuthnPublicKeyCredentialSchema = Schema.Union(
  WebAuthnPublicKeyCredentialKeyVaultSchema,
);

export type WebAuthnPublicKeyCredential = Schema.Schema.Type<
  typeof WebAuthnPublicKeyCredentialSchema
>;
