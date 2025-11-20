import { objectKeys, swapKeysAndValues } from '@repo/utils';
import * as cbor from 'cbor2';
import { assert, isEnum, isNumber, isString } from 'typanion';
import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';

import { COSEKey, type COSEKeyMap } from '../COSEKey';
import { JsonWebKey, type JsonWebKeyOptions } from '../JsonWebKey';
import { COSEKeyAlgorithm } from '../enums/COSEKeyAlgorithm';
import { COSEKeyCurve } from '../enums/COSEKeyCurve';
import { COSEKeyCurveParam } from '../enums/COSEKeyCurveParam';
import { COSEKeyParam } from '../enums/COSEKeyParam';
import { COSEKeyRsaParam } from '../enums/COSEKeyRsaParam';
import { COSEKeyType } from '../enums/COSEKeyType';
import { KeyAlgorithm } from '../enums/KeyAlgorithm';
import { KeyType } from '../enums/KeyType';

export class COSEKeyMapper {
  static jwkToCOSEKey(jwk: JsonWebKey): COSEKey {
    const alg = jwk.inferAlg();
    assert(alg, isEnum(KeyAlgorithm));

    const coseAlgorithm = COSEKeyAlgorithm[alg];

    const coseMap = new Map<number, number | Uint8Array>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case KeyType.EC: {
        const kty = jwk.kty;
        const crv = COSEKeyCurve[jwk.crv as keyof typeof COSEKeyCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());
        assert(jwk.y, isString());

        coseMap.set(COSEKeyParam.kty, COSEKeyType[kty]);
        coseMap.set(COSEKeyCurveParam.crv, crv);
        coseMap.set(COSEKeyCurveParam.x, base64ToUint8Array(jwk.x));
        coseMap.set(COSEKeyCurveParam.y, base64ToUint8Array(jwk.y));
        if (jwk.d) coseMap.set(COSEKeyCurveParam.d, base64ToUint8Array(jwk.d));
        break;
      }
      case KeyType.RSA: {
        const kty = jwk.kty;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseMap.set(COSEKeyParam.kty, COSEKeyType[kty]);
        coseMap.set(COSEKeyRsaParam.n, base64ToUint8Array(jwk.n));
        coseMap.set(COSEKeyRsaParam.e, base64ToUint8Array(jwk.e));
        if (jwk.d) coseMap.set(COSEKeyRsaParam.d, base64ToUint8Array(jwk.d));
        break;
      }
      default:
        throw new Error(
          `Invalid JWK 'kty' parameter. Expected one of: ${objectKeys(COSEKeyType).join(', ')}.`,
        );
    }

    return new COSEKey(coseMap);
  }

  static COSEKeyToJwk(coseKey: COSEKey): JsonWebKey {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: JsonWebKeyOptions = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of coseKey.map.entries()) {
      switch (key) {
        case COSEKeyParam.kty: // kty
          assert(value, isEnum(COSEKeyType));

          jwk.kty = COSE_TO_JWK_KTY[value];
          break;

        // Key-specific parameters
        default:
          // EC params
          if (jwk.kty === KeyType.EC) {
            switch (key) {
              case COSEKeyCurveParam.crv: // crv
                assert(value, isEnum(COSEKeyCurve));

                jwk.crv = COSE_TO_JWK_CRV[value];
                break;
              case COSEKeyCurveParam.x: // x
                if (value instanceof Uint8Array)
                  jwk.x = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyCurveParam.y: // y
                if (value instanceof Uint8Array)
                  jwk.y = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyCurveParam.d: // d (private key)
                if (value instanceof Uint8Array)
                  jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA) {
            switch (key) {
              case COSEKeyRsaParam.n: // n (modulus)
                if (value instanceof Uint8Array)
                  jwk.n = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyRsaParam.e: // e (exponent)
                if (value instanceof Uint8Array)
                  jwk.e = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyRsaParam.d: // d (private key)
                if (value instanceof Uint8Array)
                  jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
                break;
            }
          }
      }
    }

    return new JsonWebKey(jwk);
  }

  static bytesToCOSEKey(bytes: Uint8Array): COSEKey {
    const decoded = cbor.decode<COSEKeyMap>(bytes);
    return new COSEKey(decoded);
  }

  static COSEKeyToBytes(coseKey: COSEKey): Uint8Array {
    return cbor.encode(coseKey.map);
  }
}
