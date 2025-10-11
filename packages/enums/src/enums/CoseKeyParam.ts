import type { ValueOfEnum } from '../types.js';

// COSE Key Common Parameters
export const CoseKeyParam = {
  kty: 1,
  alg: 3,
} as const;

export type CoseKeyParam = ValueOfEnum<typeof CoseKeyParam>;
