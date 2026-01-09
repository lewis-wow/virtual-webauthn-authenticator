import type { ValueOfEnum } from '@repo/types';

import { CredentialSelectInteraction } from '../interactions/CredentialSelectInteraction';

export const InteractionsToHttpStatusCode = {
  [CredentialSelectInteraction.code]: 428,
} as const;

export type InteractionsToHttpStatusCode = ValueOfEnum<
  typeof InteractionsToHttpStatusCode
>;
