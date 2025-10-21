import { COSEKeyAlgorithm, KeyCurveName } from '@repo/enums';
import { assert, isEnum } from 'typanion';

export const COSEAlgorithmToKeyCurveNameMapper = (
  coseAlgorithm: COSEKeyAlgorithm,
): KeyCurveName => {
  assert(
    coseAlgorithm,
    isEnum([
      COSEKeyAlgorithm.ES256,
      COSEKeyAlgorithm.ES384,
      COSEKeyAlgorithm.ES512,
    ]),
  );

  switch (coseAlgorithm) {
    case COSEKeyAlgorithm.ES256:
      return KeyCurveName.P256;
    case COSEKeyAlgorithm.ES384:
      return KeyCurveName.P384;
    case COSEKeyAlgorithm.ES512:
      return KeyCurveName.P521;
  }
};
