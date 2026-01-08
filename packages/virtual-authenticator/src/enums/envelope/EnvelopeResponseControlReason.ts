import type { ValueOfEnum } from '@repo/types';

export const EnvelopeResponseControlReason = {
  CREDENTIAL_SELECT: 'CREDENTIAL_SELECT',
} as const;

export type EnvelopeResponseControlReason = ValueOfEnum<
  typeof EnvelopeResponseControlReason
>;
