import type { ValueOfEnum } from '@repo/types';

// COSE EC Key Parameters
export const COSEKeyCurveParam = {
  crv: -1,
  x: -2,
  y: -3,
  d: -4,
} as const;

export type COSEKeyCurveParam = ValueOfEnum<typeof COSEKeyCurveParam>;
