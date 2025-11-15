import { z } from 'zod';

import { WebAuthnCredentialKeyVaultDtoSchema } from './WebAuthnCredentialKeyVaultDtoSchema';

export const WebAuthnCredentialDtoSchema = z.discriminatedUnion(
  'webAuthnCredentialKeyMetaType',
  [WebAuthnCredentialKeyVaultDtoSchema],
);

export type WebAuthnCredentialDto = z.infer<typeof WebAuthnCredentialDtoSchema>;
