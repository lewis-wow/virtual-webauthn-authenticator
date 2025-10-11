import type { ValueOfEnum } from '../types.js';
import { AsymetricSigningAlgorithm } from './AsymetricSigningAlgorithm.js';

export const CoseAlgorithm = {
  [AsymetricSigningAlgorithm.ES256]: -7,
  [AsymetricSigningAlgorithm.ES384]: -35,
  [AsymetricSigningAlgorithm.ES512]: -36,
  [AsymetricSigningAlgorithm.EdDSA]: -8,
  [AsymetricSigningAlgorithm.PS256]: -37,
  [AsymetricSigningAlgorithm.HS256]: 5,
  [AsymetricSigningAlgorithm.HS384]: 6,
  [AsymetricSigningAlgorithm.HS512]: 7,
} as const;

export type CoseAlgorithm = ValueOfEnum<typeof CoseAlgorithm>;
