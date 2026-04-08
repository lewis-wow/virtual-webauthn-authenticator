import { z } from 'zod';

import { PublicKeyCredentialKeyVaultDtoSchema } from './PublicKeyCredentialKeyVaultDtoSchema';

const PUBLIC_KEY_CREDENTIAL_VARIANTS = [
  PublicKeyCredentialKeyVaultDtoSchema,
] as const;

// If there is only 1 variant, use it directly (generates clean 'type: object').
// If there are >1, use the discriminated union (generates 'oneOf').
export const PublicKeyCredentialDtoSchema = (
  PUBLIC_KEY_CREDENTIAL_VARIANTS.length === 1
    ? PUBLIC_KEY_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        PUBLIC_KEY_CREDENTIAL_VARIANTS,
      )
).meta({
  id: 'StoredPublicKeyCredential',
  title: 'StoredPublicKeyCredential',
});
