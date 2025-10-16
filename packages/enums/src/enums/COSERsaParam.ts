import z from 'zod';

import type { ValueOfEnum } from '../types.js';

// COSE RSA Key Parameters
export const COSERsaParam = {
  n: -1,
  e: -2,
  d: -3,
} as const;

export type COSERsaParam = ValueOfEnum<typeof COSERsaParam>;

export const COSERsaParamSchema = z.enum(COSERsaParam).meta({
  description: 'COSE RSA param',
});
