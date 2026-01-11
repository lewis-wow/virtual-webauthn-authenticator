import { guardSchema } from '@repo/assert';
import { swapKeysAndValues } from '@repo/utils';
import { match } from 'ts-pattern';
import z from 'zod';

import { SubtleCryptoAlg, SubtleCryptoKeyAlgName } from './enums';
import { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { JWKKeyAlgorithm } from './enums/JWKKeyAlgorithm';
import { JWKKeyCurveName } from './enums/JWKKeyCurveName';
import { JWKKeyType } from './enums/JWKKeyType';

export class KeyAlgorithmMapper {
  static readonly COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);

  static JWKKeyAlgorithmToCOSEKeyAlgorithm(
    keyAlgorithm: JWKKeyAlgorithm,
  ): COSEKeyAlgorithm {
    return COSEKeyAlgorithm[keyAlgorithm];
  }

  static COSEKeyAlgorithmToJWKKeyAlgorithm(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyAlgorithm {
    return KeyAlgorithmMapper.COSE_TO_JWK_ALG[coseKeyAlgorithm];
  }

  /**
   * Convert a COSE algorithm to JWK curve name.
   * Returns the curve name for EC and OKP keys, undefined for RSA keys.
   */
  static COSEKeyAlgorithmToJWKKeyCurveName(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyCurveName | undefined {
    const keyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseKeyAlgorithm);

    return match(keyAlgorithm)
      .with(JWKKeyAlgorithm.ES256, () => JWKKeyCurveName['P-256'])
      .with(JWKKeyAlgorithm.ES384, () => JWKKeyCurveName['P-384'])
      .with(JWKKeyAlgorithm.ES512, () => JWKKeyCurveName['P-521'])
      .otherwise(() => undefined);
  }

  /**
   * Get the recommended RSA key size for a COSE algorithm.
   * Returns undefined for non-RSA algorithms.
   */
  static COSEKeyAlgorithmToRSAKeySize(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): number | undefined {
    const keyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseKeyAlgorithm);

    return match(keyAlgorithm)
      .with(JWKKeyAlgorithm.PS256, () => 2048)
      .with(JWKKeyAlgorithm.PS384, () => 3072)
      .with(JWKKeyAlgorithm.PS512, () => 4096)
      .with(JWKKeyAlgorithm.RS256, () => 2048)
      .with(JWKKeyAlgorithm.RS384, () => 3072)
      .with(JWKKeyAlgorithm.RS512, () => 4096)
      .otherwise(() => undefined);
  }

  static COSEKeyAlgorithmToJWKKeyType(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): JWKKeyType {
    const keyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseKeyAlgorithm);

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

  /**
   * Convert a COSE algorithm ID into a corresponding hash algorithm string value that WebCrypto APIs expect.
   */
  static COSEKeyAlgorithmToSubtleCryptoAlg(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): SubtleCryptoAlg {
    const keyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseKeyAlgorithm);

    return match(keyAlgorithm)
      .with(JWKKeyAlgorithm.ES256, () => SubtleCryptoAlg['SHA-256'])
      .with(JWKKeyAlgorithm.PS256, () => SubtleCryptoAlg['SHA-256'])
      .with(JWKKeyAlgorithm.RS256, () => SubtleCryptoAlg['SHA-256'])
      .with(JWKKeyAlgorithm.ES384, () => SubtleCryptoAlg['SHA-384'])
      .with(JWKKeyAlgorithm.PS384, () => SubtleCryptoAlg['SHA-384'])
      .with(JWKKeyAlgorithm.RS384, () => SubtleCryptoAlg['SHA-384'])
      .with(JWKKeyAlgorithm.ES512, () => SubtleCryptoAlg['SHA-512'])
      .with(JWKKeyAlgorithm.PS512, () => SubtleCryptoAlg['SHA-512'])
      .with(JWKKeyAlgorithm.RS512, () => SubtleCryptoAlg['SHA-512'])
      .exhaustive();
  }

  /**
   * Convert a COSE algorithm ID into a corresponding key algorithm string value that WebCrypto APIs expect.
   */
  static COSEKeyAlgorithmToSubtleCryptoKeyAlgName(
    coseKeyAlgorithm: COSEKeyAlgorithm,
  ): SubtleCryptoKeyAlgName {
    const keyAlgorithm =
      KeyAlgorithmMapper.COSEKeyAlgorithmToJWKKeyAlgorithm(coseKeyAlgorithm);

    return match(keyAlgorithm)
      .with(JWKKeyAlgorithm.ES256, () => SubtleCryptoKeyAlgName.ECDSA)
      .with(JWKKeyAlgorithm.ES384, () => SubtleCryptoKeyAlgName.ECDSA)
      .with(JWKKeyAlgorithm.ES512, () => SubtleCryptoKeyAlgName.ECDSA)
      .with(
        JWKKeyAlgorithm.RS256,
        () => SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5'],
      )
      .with(
        JWKKeyAlgorithm.RS384,
        () => SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5'],
      )
      .with(
        JWKKeyAlgorithm.RS512,
        () => SubtleCryptoKeyAlgName['RSASSA-PKCS1-v1_5'],
      )
      .with(JWKKeyAlgorithm.PS256, () => SubtleCryptoKeyAlgName['RSA-PSS'])
      .with(JWKKeyAlgorithm.PS384, () => SubtleCryptoKeyAlgName['RSA-PSS'])
      .with(JWKKeyAlgorithm.PS512, () => SubtleCryptoKeyAlgName['RSA-PSS'])
      .exhaustive();
  }
}
