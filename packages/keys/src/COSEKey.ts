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
import type { BufferLike, Jwk } from '@repo/types';
import { objectKeys } from '@repo/utils/objectKeys';
import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';
import { decode, encode } from 'cbor';
import { assert, isEnum, isNumber, isString } from 'typanion';

export class COSEKey {
  constructor(
    private readonly coseMap = new Map<number, string | number | Buffer>(),
  ) {}

  static fromJwk(jwk: Jwk): COSEKey {
    assert(jwk.alg, isEnum(Object.values(KeyAlgorithm)));

    const coseAlgorithm = COSEKeyAlgorithm[jwk.alg];

    const coseMap = new Map<number, string | number | Buffer>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case KeyType.EC:
      case KeyType.EC_HSM: {
        const kty = jwk.kty;
        const crv = COSEKeyCurve[jwk.crv as keyof typeof COSEKeyCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());
        assert(jwk.y, isString());

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyCurveParam.crv, crv);
        coseMap.set(COSEKeyCurveParam.x, Buffer.from(jwk.x, 'base64url'));
        coseMap.set(COSEKeyCurveParam.y, Buffer.from(jwk.y, 'base64url'));
        if (jwk.d) {
          coseMap.set(COSEKeyCurveParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case KeyType.RSA:
      case KeyType.RSA_HSM: {
        const kty = jwk.kty;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyRsaParam.n, Buffer.from(jwk.n, 'base64url'));
        coseMap.set(COSEKeyRsaParam.e, Buffer.from(jwk.e, 'base64url'));
        if (jwk.d) {
          coseMap.set(COSEKeyRsaParam.d, Buffer.from(jwk.d, 'base64url'));
        }
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

  toJwk(): Jwk {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: Partial<Jwk> = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of this.coseMap.entries()) {
      switch (key) {
        case 1: // kty
          assert(value, isEnum(Object.values(COSEKeyType)));

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
                if (Buffer.isBuffer(value)) {
                  jwk.x = value.toString('base64url');
                }
                break;
              case -3: // y (EC only)
                if (jwk.kty === 'EC' && Buffer.isBuffer(value)) {
                  jwk.y = value.toString('base64url');
                }
                break;
              case -4: // d (private key)
                if (Buffer.isBuffer(value)) {
                  jwk.d = value.toString('base64url');
                }
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA || jwk.kty === KeyType.RSA_HSM) {
            switch (key) {
              case -1: // n (modulus)
                if (Buffer.isBuffer(value)) jwk.n = value.toString('base64url');
                break;
              case -2: // e (exponent)
                if (Buffer.isBuffer(value)) jwk.e = value.toString('base64url');
                break;
              case -3: // d (private key)
                if (Buffer.isBuffer(value)) jwk.d = value.toString('base64url');
                break;
            }
          }
      }
    }

    return jwk as Jwk;
  }

  toBuffer(): Buffer {
    return encode(this.coseMap);
  }

  getCoseMap(): Map<number, string | number | Buffer> {
    return this.coseMap;
  }
}
