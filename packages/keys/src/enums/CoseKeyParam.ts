import type { ValueOf } from '@repo/types';

// COSE Key Common Parameters
export const CoseKeyParam = {
  kty: 1,
  alg: 3,
} as const;

export type CoseKeyParam = ValueOf<typeof CoseKeyParam>;
