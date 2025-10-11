import type { ValueOfEnum } from '../types.js';

export const AsymetricSigningAlgorithm = {
  ES256: 'ES256',
  ES384: 'ES384',
  ES512: 'ES512',
  EdDSA: 'EdDSA',
  PS256: 'PS256',
  HS256: 'HS256',
  HS384: 'HS384',
  HS512: 'HS512',
} as const;

export type AsymetricSigningAlgorithm = ValueOfEnum<
  typeof AsymetricSigningAlgorithm
>;
