import type { Uint8Array_ } from '@repo/types';
import type { JsonWebKey } from '@repo/types/dom';
import { fromBase64Url, swapKeysAndValues, toBase64Url } from '@repo/utils';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from './COSEPublicKey';
import type { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from './exceptions/UnsupportedKeyType';

export class KeyMapper {
  static readonly CURVE_NAME_MAP = swapKeysAndValues(COSEKeyCurveName);

  private static _toBase64Url(
    bytes: Uint8Array_ | undefined,
  ): string | undefined {
    return bytes === undefined ? undefined : toBase64Url(bytes);
  }

  private static _fromBase64Url(
    base64Url: string | undefined,
  ): Uint8Array_ | undefined {
    return base64Url === undefined ? undefined : fromBase64Url(base64Url);
  }

  static COSEPublicKeyToJWKPublicKey(COSEPublicKey: COSEPublicKey): JsonWebKey {
    const kty = COSEPublicKey.get(COSEKeyParam.kty);

    const jwk: JsonWebKey = {};

    switch (kty) {
      case COSEKeyType.EC: {
        jwk.kty = 'EC';
        const COSEPublicKeyEC = COSEPublicKey as COSEPublicKeyEC;

        jwk.crv =
          KeyMapper.CURVE_NAME_MAP[COSEPublicKeyEC.get(COSEKeyTypeParam.crv)!];
        jwk.x = KeyMapper._toBase64Url(COSEPublicKeyEC.get(COSEKeyTypeParam.x));
        jwk.y = KeyMapper._toBase64Url(COSEPublicKeyEC.get(COSEKeyTypeParam.y));
        break;
      }
      case COSEKeyType.RSA: {
        const COSEPublicKeyRSA = COSEPublicKey as COSEPublicKeyRSA;
        jwk.n = KeyMapper._toBase64Url(
          COSEPublicKeyRSA.get(COSEKeyTypeParam.n),
        );
        jwk.e = KeyMapper._toBase64Url(
          COSEPublicKeyRSA.get(COSEKeyTypeParam.e),
        );
        break;
      }
      case COSEKeyType.OKP: {
        const COSEPublicKeyOKP = COSEPublicKey as COSEPublicKeyOKP;
        jwk.crv =
          KeyMapper.CURVE_NAME_MAP[COSEPublicKeyOKP.get(COSEKeyTypeParam.crv)!];
        jwk.x = KeyMapper._toBase64Url(
          COSEPublicKeyOKP.get(COSEKeyTypeParam.x),
        );
        break;
      }
      default:
        throw new UnsupportedKeyType();
    }

    return jwk;
  }

  static JWKPublicKeyToCOSEPublicKey(
    JWKPublicKey: JsonWebKey,
    alg?: COSEKeyAlgorithm,
  ): COSEPublicKey {
    const kty = JWKPublicKey.kty;

    const coseKey = new Map() as COSEPublicKey;

    // Set the algorithm parameter if provided
    // Per WebAuthn spec: The COSEKey-encoded credential public key MUST contain the "alg" parameter
    if (alg !== undefined) {
      coseKey.set(COSEKeyParam.alg, alg);
    }

    switch (kty) {
      case 'EC': {
        coseKey.set(COSEKeyParam.kty, COSEKeyType.EC);
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.crv,
          COSEKeyCurveName[JWKPublicKey.crv as keyof typeof COSEKeyCurveName],
        );
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.x,
          KeyMapper._fromBase64Url(JWKPublicKey.x),
        );
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.y,
          KeyMapper._fromBase64Url(JWKPublicKey.y),
        );
        break;
      }
      case 'RSA': {
        coseKey.set(COSEKeyParam.kty, COSEKeyType.RSA);
        (coseKey as COSEPublicKeyRSA).set(
          COSEKeyTypeParam.n,
          KeyMapper._fromBase64Url(JWKPublicKey.n),
        );
        (coseKey as COSEPublicKeyRSA).set(
          COSEKeyTypeParam.e,
          KeyMapper._fromBase64Url(JWKPublicKey.e),
        );
        break;
      }
      case 'OKP': {
        coseKey.set(COSEKeyParam.kty, COSEKeyType.OKP);
        (coseKey as COSEPublicKeyOKP).set(
          COSEKeyTypeParam.crv,
          COSEKeyCurveName[JWKPublicKey.crv as keyof typeof COSEKeyCurveName],
        );
        (coseKey as COSEPublicKeyOKP).set(
          COSEKeyTypeParam.x,
          KeyMapper._fromBase64Url(JWKPublicKey.x),
        );
        break;
      }
      default:
        throw new UnsupportedKeyType();
    }

    return coseKey;
  }
}
