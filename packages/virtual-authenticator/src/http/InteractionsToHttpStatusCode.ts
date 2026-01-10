import { HttpStatusCode } from '@repo/http';
import type { ValueOfEnum } from '@repo/types';

import { CredentialSelectInteraction } from '../interruption/authenticator/VirtualAuthenticatorCredentialSelectInteraction';

export const InteractionsToHttpStatusCode = {
  [CredentialSelectInteraction.code]: HttpStatusCode.PRECONDITION_REQUIRED,
} as const;

export type InteractionsToHttpStatusCode = ValueOfEnum<
  typeof InteractionsToHttpStatusCode
>;
