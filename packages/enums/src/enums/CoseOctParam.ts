import type { ValueOfEnum } from '../types.js';

// COSE Symmetric Key Parameters
export const CoseOctParam = {
  k: -1,
} as const;

export type CoseOctParam = ValueOfEnum<typeof CoseOctParam>;
