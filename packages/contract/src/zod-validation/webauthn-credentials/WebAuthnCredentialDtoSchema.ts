import { z } from 'zod';

import { WebAuthnCredentialKeyVaultDtoSchema } from './WebAuthnCredentialKeyVaultDtoSchema';

export const WebAuthnCredentialDtoSchema = z.discriminatedUnion(
  'webAuthnCredentialKeyMetaType',
  [WebAuthnCredentialKeyVaultDtoSchema],
);
