import type { ValueOf } from '@repo/types';

// COSE Symmetric Key Parameters
export const CoseOctParam = {
  k: -1,
} as const;

export type CoseOctParam = ValueOf<typeof CoseOctParam>;
