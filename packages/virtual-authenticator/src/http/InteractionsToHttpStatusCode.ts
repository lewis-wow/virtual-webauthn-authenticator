import type { ValueOfEnum } from '@repo/types';

import { CredentialSelectInteraction } from '../interactions/CredentialSelectInteraction';

export const InteractionsToHttpStatusCode = {
  [CredentialSelectInteraction.name]: 200,
} as const;

export type InteractionsToHttpStatusCode = ValueOfEnum<
  typeof InteractionsToHttpStatusCode
>;
