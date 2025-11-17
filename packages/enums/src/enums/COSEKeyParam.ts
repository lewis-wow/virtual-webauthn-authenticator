import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

// COSE Key Common Parameters
export const COSEKeyParam = {
  kty: 1,
  alg: 3,
} as const;

export type COSEKeyParam = ValueOfEnum<typeof COSEKeyParam>;

export const COSEKeyParamSchema = z.enum(COSEKeyParam).meta({
  description: 'COSE key param',
  examples: [COSEKeyParam.kty],
});
