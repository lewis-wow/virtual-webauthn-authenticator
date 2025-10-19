import { COSEAlgorithm, EcCurve } from '@repo/enums';
import { assert, isEnum } from 'typanion';

export const COSEAlgorithmToEcCurveMapper = (
  coseAlgorithm: COSEAlgorithm,
): EcCurve => {
  assert(
    coseAlgorithm,
    isEnum([COSEAlgorithm.ES256, COSEAlgorithm.ES384, COSEAlgorithm.ES512]),
  );

  switch (coseAlgorithm) {
    case COSEAlgorithm.ES256:
      return EcCurve.P256;
    case COSEAlgorithm.ES384:
      return EcCurve.P384;
    case COSEAlgorithm.ES512:
      return EcCurve.P521;
  }
};
