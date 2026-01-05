import { assertSchema, guardSchema } from '@repo/assert';
import { swapKeysAndValues } from '@repo/utils';
import { match } from 'ts-pattern';
import z from 'zod';

import { JWKKeyAlgorithm, JWKKeyCurveName, JWKKeyType } from '../../jwk/enums';
import { COSEKeyAlgorithm } from '../enums/COSEKeyAlgorithm';

export class COSEKeyAlgorithmMapper {
  static JWKKeyAlgorithmToCOSEKeyAlgorithm(
    keyAlgorithm: JWKKeyAlgorithm,
  ): COSEKeyAlgorithm {
    return COSEKeyAlgorithm[keyAlgorithm];
  }

  static COSEKeyAlgorithmToJWKKeyAlgorithm(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyAlgorithm {
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);

    return COSE_TO_JWK_ALG[coseKeyAlgorithm];
  }

  static COSEKeyAlgorithmToJWKKeyCurveName(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyCurveName {
    const keyAlgorithm =
      COSEKeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        coseKeyAlgorithm,
      );

    assertSchema(
      keyAlgorithm,
      z.enum([
        JWKKeyAlgorithm.ES256,
        JWKKeyAlgorithm.ES384,
        JWKKeyAlgorithm.ES512,
      ]),
    );

    switch (keyAlgorithm) {
      case JWKKeyAlgorithm.ES256:
        return JWKKeyCurveName['P-256'];
      case JWKKeyAlgorithm.ES384:
        return JWKKeyCurveName['P-384'];
      case JWKKeyAlgorithm.ES512:
        return JWKKeyCurveName['P-521'];
    }
  }

  static COSEKeyAlgorithmToJWKKeyType(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyType {
    const keyAlgorithm =
      COSEKeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(
        coseKeyAlgorithm,
      );

    return match(keyAlgorithm)
      .when(
        guardSchema(
          z.enum([
            JWKKeyAlgorithm.ES256,
            JWKKeyAlgorithm.ES384,
            JWKKeyAlgorithm.ES512,
          ]),
        ),
        () => JWKKeyType.EC,
      )
      .when(
        guardSchema(
          z.enum([
            JWKKeyAlgorithm.PS256,
            JWKKeyAlgorithm.PS384,
            JWKKeyAlgorithm.PS512,
            JWKKeyAlgorithm.RS256,
            JWKKeyAlgorithm.RS384,
            JWKKeyAlgorithm.RS512,
          ]),
        ),
        () => JWKKeyType.RSA,
      )
      .exhaustive();
  }
}
