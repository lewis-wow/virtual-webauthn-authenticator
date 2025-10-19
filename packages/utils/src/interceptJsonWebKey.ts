import type { AsymetricSigningAlgorithm } from '@repo/enums';
import type { JsonWebKey } from 'node:crypto';

import { inferJwkAsymetricSigningAlgorithmOrThrow } from './inferJwkAsymetricSigningAlgorithmOrThrow';

export const interceptJsonWebKey = <
  T extends Pick<JsonWebKey, 'kty' | 'crv'> & {
    alg?: AsymetricSigningAlgorithm;
  },
>(
  jwk: T,
): T & { alg: AsymetricSigningAlgorithm } => {
  return {
    ...jwk,
    alg: inferJwkAsymetricSigningAlgorithmOrThrow(jwk),
  };
};
