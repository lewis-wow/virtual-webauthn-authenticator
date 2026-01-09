import { swapKeysAndValues } from '@repo/utils';
import { Buffer } from 'buffer';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from './COSEPublicKey';
import type { JSONWebPublicKey } from './JSONWebPublicKey';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from './exceptions/UnsupportedKeyType';

export class KeyMapper {
  static readonly CURVE_NAME_MAP = swapKeysAndValues(COSEKeyCurveName);

  private static _toB64(bytes: Uint8Array | undefined): string | undefined {
    if (bytes === undefined) {
      return undefined;
    }

    return Buffer.from(bytes).toString('base64url');
  }

  private static _fromB64(b64: string | undefined): Uint8Array | undefined {
    if (b64 === undefined) {
      return undefined;
    }

    return new Uint8Array(Buffer.from(b64, 'base64url'));
  }

  static COSEPublicKeyToJWKPublicKey(
    COSEPublicKey: COSEPublicKey,
  ): JSONWebPublicKey {
    const kty = COSEPublicKey.get(COSEKeyParam.kty);

    const jwk: JSONWebPublicKey = {};

    switch (kty) {
      case COSEKeyType.EC: {
        jwk.kty = 'EC';
        const COSEPublicKeyEC = COSEPublicKey as COSEPublicKeyEC;

        jwk.crv =
          KeyMapper.CURVE_NAME_MAP[COSEPublicKeyEC.get(COSEKeyTypeParam.crv)!];
        jwk.x = KeyMapper._toB64(COSEPublicKeyEC.get(COSEKeyTypeParam.x));
        jwk.y = KeyMapper._toB64(COSEPublicKeyEC.get(COSEKeyTypeParam.y));
        break;
      }
      case COSEKeyType.RSA: {
        const COSEPublicKeyRSA = COSEPublicKey as COSEPublicKeyRSA;
        jwk.n = KeyMapper._toB64(COSEPublicKeyRSA.get(COSEKeyTypeParam.n));
        jwk.e = KeyMapper._toB64(COSEPublicKeyRSA.get(COSEKeyTypeParam.e));
        break;
      }
      case COSEKeyType.OKP: {
        const COSEPublicKeyOKP = COSEPublicKey as COSEPublicKeyOKP;
        jwk.crv =
          KeyMapper.CURVE_NAME_MAP[COSEPublicKeyOKP.get(COSEKeyTypeParam.crv)!];
        jwk.x = KeyMapper._toB64(COSEPublicKeyOKP.get(COSEKeyTypeParam.x));
        break;
      }
      default:
        throw new UnsupportedKeyType();
    }

    return jwk;
  }

  static JWKPublicKeyToCOSEPublicKey(
    JWKPublicKey: JSONWebPublicKey,
  ): COSEPublicKey {
    const kty = JWKPublicKey.kty;

    const coseKey = new Map() as COSEPublicKey;

    switch (kty) {
      case 'EC': {
        coseKey.set(COSEKeyParam.kty, COSEKeyType.EC);
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.crv,
          COSEKeyCurveName[JWKPublicKey.crv as keyof typeof COSEKeyCurveName],
        );
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.x,
          KeyMapper._fromB64(JWKPublicKey.x),
        );
        (coseKey as COSEPublicKeyEC).set(
          COSEKeyTypeParam.y,
          KeyMapper._fromB64(JWKPublicKey.y),
        );
        break;
      }
      case 'RSA': {
        coseKey.set(COSEKeyParam.kty, COSEKeyType.RSA);
        (coseKey as COSEPublicKeyRSA).set(
          COSEKeyTypeParam.n,
          KeyMapper._fromB64(JWKPublicKey.n),
        );
        (coseKey as COSEPublicKeyRSA).set(
          COSEKeyTypeParam.e,
          KeyMapper._fromB64(JWKPublicKey.e),
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
          KeyMapper._fromB64(JWKPublicKey.x),
        );
        break;
      }
      default:
        throw new UnsupportedKeyType();
    }

    return coseKey;
  }
}
