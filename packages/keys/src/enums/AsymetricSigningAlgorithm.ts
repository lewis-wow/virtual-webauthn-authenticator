import type { ValueOf } from '@repo/types';

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

export type AsymetricSigningAlgorithm = ValueOf<
  typeof AsymetricSigningAlgorithm
>;
