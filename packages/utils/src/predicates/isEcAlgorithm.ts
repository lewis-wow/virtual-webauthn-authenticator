import { AsymetricSigningAlgorithm } from '@repo/enums';
import { isEnum } from 'typanion';

export const isEcAlgorithm = isEnum([
  AsymetricSigningAlgorithm.ES256,
  AsymetricSigningAlgorithm.ES384,
  AsymetricSigningAlgorithm.ES512,
]);
