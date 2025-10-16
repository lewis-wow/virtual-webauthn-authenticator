import z from 'zod';

import type { ValueOfEnum } from '../types.js';

// COSE Key Common Parameters
export const COSEKeyParam = {
  kty: 1,
  alg: 3,
} as const;

export type COSEKeyParam = ValueOfEnum<typeof COSEKeyParam>;

export const COSEKeyParamSchema = z.enum(COSEKeyParam).meta({
  description: 'COSE key param',
});
