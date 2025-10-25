import z from 'zod';

import type { ValueOfEnum } from '../types';

// COSE RSA Key Parameters
export const COSEKeyRsaParam = {
  n: -1,
  e: -2,
  d: -3,
} as const;

export type COSEKeyRsaParam = ValueOfEnum<typeof COSEKeyRsaParam>;

export const COSEKeyRsaParamSchema = z.enum(COSEKeyRsaParam).meta({
  description: 'COSE RSA param',
  examples: [COSEKeyRsaParam.n],
});
