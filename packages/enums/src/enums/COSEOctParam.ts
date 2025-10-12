import type { ValueOfEnum } from '../types.js';

// COSE Symmetric Key Parameters
export const COSEOctParam = {
  k: -1,
} as const;

export type COSEOctParam = ValueOfEnum<typeof COSEOctParam>;
