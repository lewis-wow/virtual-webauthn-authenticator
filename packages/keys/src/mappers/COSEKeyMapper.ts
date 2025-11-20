import { objectKeys, swapKeysAndValues } from '@repo/utils';
import * as cbor from 'cbor-x';
import { assert, isEnum, isNumber, isString } from 'typanion';

import { COSEKey } from '../COSEKey';
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
        coseMap.set(COSEKeyCurveParam.x, Buffer.from(jwk.x, 'base64url'));
        coseMap.set(COSEKeyCurveParam.y, Buffer.from(jwk.y, 'base64url'));
        if (jwk.d)
          coseMap.set(COSEKeyCurveParam.d, Buffer.from(jwk.d, 'base64url'));
        break;
      }
      case KeyType.RSA: {
        const kty = jwk.kty;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseMap.set(COSEKeyParam.kty, COSEKeyType[kty]);
        coseMap.set(COSEKeyRsaParam.n, Buffer.from(jwk.n, 'base64url'));
        coseMap.set(COSEKeyRsaParam.e, Buffer.from(jwk.e, 'base64url'));
        if (jwk.d)
          coseMap.set(COSEKeyRsaParam.d, Buffer.from(jwk.d, 'base64url'));
        break;
      }
      default:
        throw new Error(
          `Invalid JWK 'kty' parameter. Expected one of: ${objectKeys(COSEKeyType).join(', ')}.`,
        );
    }

    return new COSEKey(coseMap);
  }

  static bytesToCOSEKey(bytes: Uint8Array): COSEKey {
    return new COSEKey(cbor.decode(bytes));
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
                if (Buffer.isBuffer(value)) jwk.x = value.toString('base64url');
                break;
              case COSEKeyCurveParam.y: // y
                if (Buffer.isBuffer(value)) jwk.y = value.toString('base64url');
                break;
              case COSEKeyCurveParam.d: // d (private key)
                if (Buffer.isBuffer(value)) jwk.d = value.toString('base64url');
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA) {
            switch (key) {
              case COSEKeyRsaParam.n: // n (modulus)
                if (Buffer.isBuffer(value)) jwk.n = value.toString('base64url');
                break;
              case COSEKeyRsaParam.e: // e (exponent)
                if (Buffer.isBuffer(value)) jwk.e = value.toString('base64url');
                break;
              case COSEKeyRsaParam.d: // d (private key)
                if (Buffer.isBuffer(value)) jwk.d = value.toString('base64url');
                break;
            }
          }
      }
    }

    return new JsonWebKey(jwk);
  }

  COSEKeyToBytes(coseKey: COSEKey): Uint8Array {
    return cbor.encode(coseKey.map);
  }
}
