import type { ValueOfEnum } from '../types.js';

// COSE EC Key Parameters
export const COSEEcParam = {
  crv: -1,
  x: -2,
  y: -3,
  d: -4,
} as const;

export type COSEEcParam = ValueOfEnum<typeof COSEEcParam>;
