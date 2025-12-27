import z from 'zod';

import { WebAuthnCredentialKeyVaultSchema } from './WebAuthnCredentialKeyVaultSchema';

const WEBAUTHN_CREDENTIAL_VARIANTS = [
  WebAuthnCredentialKeyVaultSchema,
] as const;

// If there is only 1 variant, use it directly (generates clean 'type: object').
// If there are >1, use the discriminated union (generates 'oneOf').
export const WebAuthnCredentialSchema =
  WEBAUTHN_CREDENTIAL_VARIANTS.length === 1
    ? WEBAUTHN_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        WEBAUTHN_CREDENTIAL_VARIANTS,
      );

export type WebAuthnCredential = z.infer<typeof WebAuthnCredentialSchema>;
