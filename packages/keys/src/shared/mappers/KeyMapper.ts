import { assertSchema } from '@repo/assert';
import { EncodingMapper } from '@repo/core/mappers';
import { swapKeysAndValues } from '@repo/utils';
import z from 'zod';

import { COSEKey } from '../../cose/COSEKey';
import { COSEKeyAlgorithm } from '../../cose/enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from '../../cose/enums/COSEKeyCurveName';
import { COSEKeyParam } from '../../cose/enums/COSEKeyParam';
import { COSEKeyType } from '../../cose/enums/COSEKeyType';
import { COSEKeyTypeParam } from '../../cose/enums/COSEKeyTypeParam';
import { JsonWebKey, type JsonWebKeyOptions } from '../../jwk/JsonWebKey';
import { JWKKeyCurveName } from '../../jwk/enums/JWKKeyCurveName';
import { JWKKeyType } from '../../jwk/enums/JWKKeyType';
import { UnsupportedKeyType } from '../exceptions/UnsupportedKeyType';

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

    coseMap.set(COSEKeyTypeParam.EC_crv, crv);
    coseMap.set(COSEKeyTypeParam.EC_x, EncodingMapper.base64urlToBytes(jwk.x));
    coseMap.set(COSEKeyTypeParam.EC_y, EncodingMapper.base64urlToBytes(jwk.y));

    if (jwk.d) {
      coseMap.set(
        COSEKeyTypeParam.EC_d,
        EncodingMapper.base64urlToBytes(jwk.d),
      );
    }
  }

  private static addRSAParametersToCOSE(
    jwk: JsonWebKey,
    coseMap: Map<number, number | Uint8Array>,
  ): void {
    assertSchema(jwk.n, z.string());
    assertSchema(jwk.e, z.string());

    coseMap.set(COSEKeyTypeParam.RSA_n, EncodingMapper.base64urlToBytes(jwk.n));
    coseMap.set(COSEKeyTypeParam.RSA_e, EncodingMapper.base64urlToBytes(jwk.e));

    if (jwk.d) {
      coseMap.set(
        COSEKeyTypeParam.RSA_d,
        EncodingMapper.base64urlToBytes(jwk.d),
      );
    }
  }

  private static mapKeyType(
    value: number | Uint8Array,
    jwk: JsonWebKeyOptions,
  ): void {
    assertSchema(value, z.enum(COSEKeyType));
    jwk.kty = KeyMapper.COSE_TO_JWK_KTY[value];
  }

  private static mapECParameter(
    key: number,
    value: number | Uint8Array,
    jwk: JsonWebKeyOptions,
  ): void {
    switch (key) {
      case COSEKeyTypeParam.EC_crv:
        assertSchema(value, z.enum(COSEKeyCurveName));
        jwk.crv = KeyMapper.COSE_TO_JWK_CRV[value];
        break;
      case COSEKeyTypeParam.EC_x:
        if (value instanceof Uint8Array) {
          jwk.x = EncodingMapper.bytesToBase64url(value);
        }
        break;
      case COSEKeyTypeParam.EC_y:
        if (value instanceof Uint8Array) {
          jwk.y = EncodingMapper.bytesToBase64url(value);
        }
        break;
      case COSEKeyTypeParam.EC_d:
        if (value instanceof Uint8Array) {
          jwk.d = EncodingMapper.bytesToBase64url(value);
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
          jwk.n = EncodingMapper.bytesToBase64url(value);
        }
        break;
      case COSEKeyTypeParam.RSA_e:
        if (value instanceof Uint8Array) {
          jwk.e = EncodingMapper.bytesToBase64url(value);
        }
        break;
      case COSEKeyTypeParam.RSA_d:
        if (value instanceof Uint8Array) {
          jwk.d = EncodingMapper.bytesToBase64url(value);
        }
        break;
    }
  }
}
