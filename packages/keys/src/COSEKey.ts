import {
  KeyAlgorithm,
  COSEKeyAlgorithm,
  COSEKeyCurve,
  COSEKeyCurveParam,
  COSEKeyParam,
  COSEKeyType,
  COSEKeyRsaParam,
  KeyType,
} from '@repo/enums';
import type { BufferLike } from '@repo/types';
import { objectKeys } from '@repo/utils/objectKeys';
import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';
import { decode, encode } from 'cbor';
import { assert, isEnum, isInstanceOf, isNumber } from 'typanion';

import { JsonWebKey } from './JsonWebKey';

export class COSEKey {
  constructor(
    public readonly coseMap = new Map<number, string | number | Uint8Array>(),
  ) {}

  static fromJwk(jwk: JsonWebKey): COSEKey {
    assert(jwk.alg, isEnum(Object.values(KeyAlgorithm)));

    const coseAlgorithm = COSEKeyAlgorithm[jwk.alg];

    const coseMap = new Map<number, number | string | Uint8Array>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case KeyType.EC:
      case KeyType.EC_HSM: {
        const kty = jwk.kty;
        const crv = COSEKeyCurve[jwk.crv as keyof typeof COSEKeyCurve];

        assert(crv, isNumber());
        assert(jwk.x, isInstanceOf(Uint8Array));
        assert(jwk.y, isInstanceOf(Uint8Array));

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyCurveParam.crv, crv);
        coseMap.set(COSEKeyCurveParam.x, jwk.x);
        coseMap.set(COSEKeyCurveParam.y, jwk.y);
        if (jwk.d) coseMap.set(COSEKeyCurveParam.d, jwk.d);
        break;
      }
      case KeyType.RSA:
      case KeyType.RSA_HSM: {
        const kty = jwk.kty;

        assert(jwk.n, isInstanceOf(Uint8Array));
        assert(jwk.e, isInstanceOf(Uint8Array));

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyRsaParam.n, jwk.n);
        coseMap.set(COSEKeyRsaParam.e, jwk.e);
        if (jwk.d) coseMap.set(COSEKeyRsaParam.d, jwk.d);
        break;
      }
      default:
        throw new Error(
          `Invalid JWK 'kty' parameter. Expected one of: ${objectKeys(COSEKeyType).join(', ')}.`,
        );
    }

    return new COSEKey(coseMap);
  }

  static fromBuffer(buffer: BufferLike): COSEKey {
    return new COSEKey(decode(buffer));
  }

  toJwk(): JsonWebKey {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: Partial<JsonWebKey> = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of this.coseMap.entries()) {
      switch (key) {
        case 1: // kty
          assert(value, isEnum(COSEKeyType));

          jwk.kty = COSE_TO_JWK_KTY[value as keyof typeof COSE_TO_JWK_KTY];
          break;
        case 3: // alg
          jwk.alg = COSE_TO_JWK_ALG[value as keyof typeof COSE_TO_JWK_ALG];
          break;

        // Key-specific parameters
        default:
          // EC params
          if (jwk.kty === KeyType.EC || jwk.kty === KeyType.EC_HSM) {
            switch (key) {
              case -1: // crv
                jwk.crv =
                  COSE_TO_JWK_CRV[value as keyof typeof COSE_TO_JWK_CRV];
                break;
              case -2: // x
                if (Buffer.isBuffer(value)) jwk.x = value;
                break;
              case -3: // y (EC only)
                if (
                  (jwk.kty === KeyType.EC || jwk.kty === KeyType.EC_HSM) &&
                  Buffer.isBuffer(value)
                )
                  jwk.y = value;
                break;
              case -4: // d (private key)
                if (Buffer.isBuffer(value)) jwk.d = value;
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA || jwk.kty === KeyType.RSA_HSM) {
            switch (key) {
              case -1: // n (modulus)
                if (Buffer.isBuffer(value)) jwk.n = value;
                break;
              case -2: // e (exponent)
                if (Buffer.isBuffer(value)) jwk.e = value;
                break;
              case -3: // d (private key)
                if (Buffer.isBuffer(value)) jwk.d = value;
                break;
            }
          }
      }
    }

    return new JsonWebKey(jwk);
  }

  toBuffer(): Buffer {
    return encode(this.coseMap);
  }
}
