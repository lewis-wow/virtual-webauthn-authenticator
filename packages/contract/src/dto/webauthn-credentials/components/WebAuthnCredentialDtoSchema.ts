import { z } from 'zod';

import { WebAuthnCredentialKeyVaultDtoSchema } from './WebAuthnCredentialKeyVaultDtoSchema';

const WEBAUTHN_CREDENTIAL_VARIANTS = [
  WebAuthnCredentialKeyVaultDtoSchema,
] as const;

// If there is only 1 variant, use it directly (generates clean 'type: object').
// If there are >1, use the discriminated union (generates 'oneOf').
export const WebAuthnCredentialDtoSchema = (
  WEBAUTHN_CREDENTIAL_VARIANTS.length === 1
    ? WEBAUTHN_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnCredentialKeyMetaType',
        WEBAUTHN_CREDENTIAL_VARIANTS,
      )
).meta({
  id: 'WebAuthnCredential',
  title: 'WebAuthnCredential',
});
