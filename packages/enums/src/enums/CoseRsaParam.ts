import type { ValueOfEnum } from '../types.js';

// COSE RSA Key Parameters
export const CoseRsaParam = {
  n: -1,
  e: -2,
  d: -3,
} as const;

export type CoseRsaParam = ValueOfEnum<typeof CoseRsaParam>;
