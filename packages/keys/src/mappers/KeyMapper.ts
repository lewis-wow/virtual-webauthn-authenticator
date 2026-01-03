import { assertSchema } from '@repo/assert';
import { swapKeysAndValues } from '@repo/utils';
import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';
import z from 'zod';

import { COSEKey } from '../cose/COSEKey';
import { COSEKeyAlgorithm } from '../cose/enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from '../cose/enums/COSEKeyCurveName';
import { COSEKeyParam } from '../cose/enums/COSEKeyParam';
import { COSEKeyType } from '../cose/enums/COSEKeyType';
import { COSEKeyTypeParam } from '../cose/enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from '../exceptions/UnsupportedKeyType';
import { JsonWebKey, type JsonWebKeyOptions } from '../jwk/JsonWebKey';
import { JWKKeyCurveName } from '../jwk/enums/JWKKeyCurveName';
import { JWKKeyType } from '../jwk/enums/JWKKeyType';

export class KeyMapper {
  private static readonly COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
  private static readonly COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurveName);

  static JWKToCOSE(jwk: JsonWebKey): COSEKey {
    const coseMap = this.createBaseCOSEMap(jwk);

    switch (jwk.kty) {
      case JWKKeyType.EC:
        this.addECParametersToCOSE(jwk, coseMap);
        break;
      case JWKKeyType.RSA:
        this.addRSAParametersToCOSE(jwk, coseMap);
        break;
      default:
        throw new UnsupportedKeyType();
    }

    return new COSEKey(coseMap);
  }

  static COSEToJWK(coseKey: COSEKey): JsonWebKey {
    const jwk: JsonWebKeyOptions = {};

    for (const [key, value] of coseKey.map.entries()) {
      if (key === COSEKeyParam.kty) {
        this.mapKeyType(value as number, jwk);
      } else if (jwk.kty === JWKKeyType.EC) {
        this.mapECParameter(key, value as number | Uint8Array, jwk);
      } else if (jwk.kty === JWKKeyType.RSA) {
        this.mapRSAParameter(key, value as number | Uint8Array, jwk);
      }
    }

    return new JsonWebKey(jwk);
  }

  private static createBaseCOSEMap(
    jwk: JsonWebKey,
  ): Map<number, number | Uint8Array> {
    const alg = jwk.getAlg();
    assertSchema(alg, z.enum(swapKeysAndValues(COSEKeyAlgorithm)));

    const coseAlgorithm = COSEKeyAlgorithm[alg];
    const coseMap = new Map<number, number | Uint8Array>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    if (!jwk.kty) {
      throw new UnsupportedKeyType();
    }
    coseMap.set(COSEKeyParam.kty, COSEKeyType[jwk.kty]);

    return coseMap;
  }

  private static addECParametersToCOSE(
    jwk: JsonWebKey,
    coseMap: Map<number, number | Uint8Array>,
  ): void {
    assertSchema(jwk.crv, z.enum(JWKKeyCurveName));
    assertSchema(jwk.x, z.string());
    assertSchema(jwk.y, z.string());

    const crv = COSEKeyCurveName[jwk.crv];
    assertSchema(crv, z.number());

    coseMap.set(COSEKeyTypeParam.EC2_crv, crv);
    coseMap.set(COSEKeyTypeParam.EC2_x, base64ToUint8Array(jwk.x));
    coseMap.set(COSEKeyTypeParam.EC2_y, base64ToUint8Array(jwk.y));

    if (jwk.d) {
      coseMap.set(COSEKeyTypeParam.EC2_d, base64ToUint8Array(jwk.d));
    }
  }

  private static addRSAParametersToCOSE(
    jwk: JsonWebKey,
    coseMap: Map<number, number | Uint8Array>,
  ): void {
    assertSchema(jwk.n, z.string());
    assertSchema(jwk.e, z.string());

    coseMap.set(COSEKeyTypeParam.RSA_n, base64ToUint8Array(jwk.n));
    coseMap.set(COSEKeyTypeParam.RSA_e, base64ToUint8Array(jwk.e));

    if (jwk.d) {
      coseMap.set(COSEKeyTypeParam.RSA_d, base64ToUint8Array(jwk.d));
    }
  }

  private static mapKeyType(
    value: number | Uint8Array,
    jwk: JsonWebKeyOptions,
  ): void {
    assertSchema(value, z.enum(COSEKeyType));
    jwk.kty = this.COSE_TO_JWK_KTY[value];
  }

  private static mapECParameter(
    key: number,
    value: number | Uint8Array,
    jwk: JsonWebKeyOptions,
  ): void {
    switch (key) {
      case COSEKeyTypeParam.EC2_crv:
        assertSchema(value, z.enum(COSEKeyCurveName));
        jwk.crv = this.COSE_TO_JWK_CRV[value];
        break;
      case COSEKeyTypeParam.EC2_x:
        if (value instanceof Uint8Array) {
          jwk.x = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
      case COSEKeyTypeParam.EC2_y:
        if (value instanceof Uint8Array) {
          jwk.y = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
      case COSEKeyTypeParam.EC2_d:
        if (value instanceof Uint8Array) {
          jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
    }
  }

  private static mapRSAParameter(
    key: number,
    value: number | Uint8Array,
    jwk: JsonWebKeyOptions,
  ): void {
    switch (key) {
      case COSEKeyTypeParam.RSA_n:
        if (value instanceof Uint8Array) {
          jwk.n = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
      case COSEKeyTypeParam.RSA_e:
        if (value instanceof Uint8Array) {
          jwk.e = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
      case COSEKeyTypeParam.RSA_d:
        if (value instanceof Uint8Array) {
          jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
        }
        break;
    }
  }
}
