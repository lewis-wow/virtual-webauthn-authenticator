import { assertSchema, guardSchema } from '@repo/assert';
import { swapKeysAndValues } from '@repo/utils';
import { match } from 'ts-pattern';
import z from 'zod';

import { COSEKeyAlgorithm } from '../enums/COSEKeyAlgorithm';
import { KeyAlgorithm } from '../enums/KeyAlgorithm';
import { KeyCurveName } from '../enums/KeyCurveName';
import { KeyType } from '../enums/KeyType';
import {
  KeyCurveAlgorithmSchema,
  KeyRsaAlgorithmSchema,
} from '../zod-validation';

export class COSEKeyAlgorithmMapper {
  static keyAlgorithmToCOSEKeyAlgorithm(
    keyAlgorithm: KeyAlgorithm,
  ): COSEKeyAlgorithm {
    return COSEKeyAlgorithm[keyAlgorithm];
  }

  static COSEKeyAlgorithmToKeyAlgorithm(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): KeyAlgorithm {
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);

    return COSE_TO_JWK_ALG[coseKeyAlgorithm];
  }

  static COSEKeyAlgorithmToKeyCurveName(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): KeyCurveName {
    const keyAlgorithm =
      COSEKeyAlgorithmMapper.COSEKeyAlgorithmToKeyAlgorithm(coseKeyAlgorithm);

    assertSchema(
      keyAlgorithm,
      z.enum([KeyAlgorithm.ES256, KeyAlgorithm.ES384, KeyAlgorithm.ES512]),
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

  static COSEKeyAlgorithmToKeyType(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): KeyType {
    const keyAlgorithm =
      COSEKeyAlgorithmMapper.COSEKeyAlgorithmToKeyAlgorithm(coseKeyAlgorithm);

    return match(keyAlgorithm)
      .when(guardSchema(KeyCurveAlgorithmSchema), () => KeyType.EC)
      .when(guardSchema(KeyRsaAlgorithmSchema), () => KeyType.RSA)
      .exhaustive();
  }
}
