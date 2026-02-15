import z from 'zod';

import { CredentialSelectionStateSchema } from './states/CredentialSelectionStateSchema';
import { UserPresenceStateSchema } from './states/UserPresenceStateSchema';
import { UserVerificationStateSchema } from './states/UserVerificationStateSchema';

export const AuthenticationStateSchema = z
  .object({
    ...UserPresenceStateSchema.shape,
    ...UserVerificationStateSchema.shape,
    ...CredentialSelectionStateSchema.shape,
  })
  .partial();

export type AuthenticationState = z.infer<typeof AuthenticationStateSchema>;
