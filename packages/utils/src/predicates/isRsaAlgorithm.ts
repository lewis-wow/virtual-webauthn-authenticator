import { AsymetricSigningAlgorithm } from '@repo/enums';
import { isEnum } from 'typanion';

export const isRsaAlgorithm = isEnum([
  AsymetricSigningAlgorithm.PS256,
  AsymetricSigningAlgorithm.PS384,
  AsymetricSigningAlgorithm.PS512,
  AsymetricSigningAlgorithm.RS256,
  AsymetricSigningAlgorithm.RS384,
  AsymetricSigningAlgorithm.RS512,
  AsymetricSigningAlgorithm.RS1,
]);
