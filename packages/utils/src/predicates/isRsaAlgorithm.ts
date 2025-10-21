import { KeyAlgorithm } from '@repo/enums';
import { isEnum } from 'typanion';

export const isRsaAlgorithm = isEnum([
  KeyAlgorithm.PS256,
  KeyAlgorithm.PS384,
  KeyAlgorithm.PS512,
  KeyAlgorithm.RS256,
  KeyAlgorithm.RS384,
  KeyAlgorithm.RS512,
  KeyAlgorithm.RS1,
]);
