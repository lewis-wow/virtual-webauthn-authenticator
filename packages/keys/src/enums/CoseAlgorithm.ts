import type { ValueOf } from '@repo/types';

export const CoseAlgorithm = {
  ES256: -7,
  ES384: -35,
  ES512: -36,
  EdDSA: -8,
  PS256: -37,
  HS256: 5,
  HS384: 6,
  HS512: 7,
} as const;

export type CoseAlgorithm = ValueOf<typeof CoseAlgorithm>;
