import { swapKeysAndValues } from '@repo/utils';
import { match } from 'ts-pattern';
import { assert, isEnum } from 'typanion';

import { COSEKeyAlgorithm } from '../enums/COSEKeyAlgorithm';
import { KeyAlgorithm } from '../enums/KeyAlgorithm';
import { KeyCurveAlgorithm } from '../enums/KeyCurveAlgorithm';
import { KeyCurveName } from '../enums/KeyCurveName';
import { KeyRsaAlgorithm } from '../enums/KeyRsaAlgorithm';
import { KeyType } from '../enums/KeyType';

export class COSEKeyAlgorithmMapper {
  static toKeyAlgorithm(value: COSEKeyAlgorithm): KeyAlgorithm {
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);

    return COSE_TO_JWK_ALG[value];
  }

  static toCurve(value: COSEKeyAlgorithm): KeyCurveName {
    const keyAlgorithm = COSEKeyAlgorithmMapper.toKeyAlgorithm(value);

    assert(
      keyAlgorithm,
      isEnum([KeyAlgorithm.ES256, KeyAlgorithm.ES384, KeyAlgorithm.ES512]),
    );

    switch (keyAlgorithm) {
      case KeyAlgorithm.ES256:
        return KeyCurveName.P256;
      case KeyAlgorithm.ES384:
        return KeyCurveName.P384;
      case KeyAlgorithm.ES512:
        return KeyCurveName.P521;
    }
  }

  static toKeyType(value: COSEKeyAlgorithm): KeyType {
    const keyAlgorithm = COSEKeyAlgorithmMapper.toKeyAlgorithm(value);

    return match(keyAlgorithm)
      .when(isEnum(KeyCurveAlgorithm), () => KeyType.EC)
      .when(isEnum(KeyRsaAlgorithm), () => KeyType.RSA)
      .exhaustive();
  }
}
