import { z } from 'zod';

import { WebAuthnPublicKeyCredentialKeyVaultDtoSchema } from './WebAuthnPublicKeyCredentialKeyVaultDtoSchema';

const WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS = [
  WebAuthnPublicKeyCredentialKeyVaultDtoSchema,
] as const;

// If there is only 1 variant, use it directly (generates clean 'type: object').
// If there are >1, use the discriminated union (generates 'oneOf').
export const WebAuthnPublicKeyCredentialDtoSchema = (
  WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS.length === 1
    ? WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        WEBAUTHN_PUBLIC_KEY_CREDENTIAL_VARIANTS,
      )
).meta({
  id: 'WebAuthnPublicKeyCredential',
  title: 'WebAuthnPublicKeyCredential',
});
