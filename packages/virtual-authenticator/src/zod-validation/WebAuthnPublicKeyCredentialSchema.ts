import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyVaultSchema } from './WebAuthnPublicKeyCredentialKeyVaultSchema';

const WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS = [
  WebAuthnPublicKeyCredentialKeyVaultSchema,
] as const;

// If there is only 1 variant, use it directly (generates clean 'type: object').
// If there are >1, use the discriminated union (generates 'oneOf').
export const WebAuthnPublicKeyCredentialSchema =
  WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS.length === 1
    ? WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS,
      );

export type WebAuthnPublicKeyCredential = z.infer<typeof WebAuthnPublicKeyCredentialSchema>;
