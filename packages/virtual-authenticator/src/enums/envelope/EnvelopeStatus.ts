import type { ValueOfEnum } from '@repo/types';

export const EnvelopeStatus = {
  SUCCESS: 'SUCCESS',
  INTERACTION_REQUIRED: 'INTERACTION_REQUIRED',
} as const;

export type EnvelopeStatus = ValueOfEnum<typeof EnvelopeStatus>;
