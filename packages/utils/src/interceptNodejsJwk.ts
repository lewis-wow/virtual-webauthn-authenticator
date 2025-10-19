import type { Jwk } from '@repo/types';
import type { JsonWebKey } from 'node:crypto';
import { assert, isString } from 'typanion';

import { getJwkAsymetricSigningAlg } from './getJwkAsymetricSigningAlg';

export const interceptNodejsJwk = (nodejsJwk: JsonWebKey): Jwk => {
  const alg = getJwkAsymetricSigningAlg(nodejsJwk);

  assert(alg, isString());

  return {
    ...nodejsJwk,
    alg,
  };
};
