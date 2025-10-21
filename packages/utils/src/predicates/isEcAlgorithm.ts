import { KeyAlgorithm } from '@repo/enums';
import { isEnum } from 'typanion';

export const isEcAlgorithm = isEnum([
  KeyAlgorithm.ES256,
  KeyAlgorithm.ES384,
  KeyAlgorithm.ES512,
]);
