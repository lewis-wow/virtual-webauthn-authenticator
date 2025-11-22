import type { ValueOfEnum } from '@repo/types';

// COSE RSA Key Parameters
export const COSEKeyRsaParam = {
  n: -1,
  e: -2,
  d: -3,
} as const;

export type COSEKeyRsaParam = ValueOfEnum<typeof COSEKeyRsaParam>;
