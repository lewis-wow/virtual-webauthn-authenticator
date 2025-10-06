import type { ValueOf } from '@repo/types';

// COSE RSA Key Parameters
export const CoseRsaParam = {
  n: -1,
  e: -2,
  d: -3,
} as const;

export type CoseRsaParam = ValueOf<typeof CoseRsaParam>;
