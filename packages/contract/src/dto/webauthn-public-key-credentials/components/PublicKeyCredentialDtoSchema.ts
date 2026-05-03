import { z } from 'zod';

import { PublicKeyCredentialKeyVaultDtoSchema } from './PublicKeyCredentialKeyVaultDtoSchema';

const PUBLIC_KEY_CREDENTIAL_VARIANTS = [
  PublicKeyCredentialKeyVaultDtoSchema,
] as const;

export const PublicKeyCredentialDtoSchema =
  PUBLIC_KEY_CREDENTIAL_VARIANTS.length === 1
    ? PUBLIC_KEY_CREDENTIAL_VARIANTS[0]
    : z.discriminatedUnion(
        'webAuthnPublicKeyCredentialKeyMetaType',
        PUBLIC_KEY_CREDENTIAL_VARIANTS,
      );
