import z from 'zod';

import type { ValueOfEnum } from '../types';

// COSE EC Key Parameters
export const COSEKeyCurveParam = {
  crv: -1,
  x: -2,
  y: -3,
  d: -4,
} as const;

export type COSEKeyCurveParam = ValueOfEnum<typeof COSEKeyCurveParam>;

export const COSEKeyCurveParamSchema = z.enum(COSEKeyCurveParam).meta({
  description: 'COSE key curve param',
  examples: [COSEKeyCurveParam.crv],
});
