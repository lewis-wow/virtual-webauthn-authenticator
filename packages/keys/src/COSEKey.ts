import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';
import {
  COSEAlgorithm,
  COSEKeyParam,
  COSEEcCurve,
  COSEEcParam,
  COSEKeyType,
  COSERsaParam,
  AsymetricSigningAlgorithm,
} from '@repo/enums';
import { getJwkAsymetricSigningAlg } from './getJwkAsymetricSigningAlg.js';
import type { Jwk } from '@repo/types';
import { encode, decode } from 'cbor';
import { assert, isEnum, isNumber, isString } from 'typanion';
import { objectKeys } from '@repo/utils/objectKeys';
import type { BufferLike } from '@repo/types';

export class COSEKey {
  constructor(
    private readonly coseMap = new Map<number, string | number | Buffer>(),
  ) {}

  static fromJwk(jwk: Jwk): COSEKey {
    const asymetricSigningAlgorithm = getJwkAsymetricSigningAlg(jwk);

    assert(
      asymetricSigningAlgorithm,
      isEnum(Object.values(AsymetricSigningAlgorithm)),
    );

    const coseAlgorithm = COSEAlgorithm[asymetricSigningAlgorithm];

    const coseMap = new Map<number, string | number | Buffer>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case 'OKP': {
        const kty = COSEKeyType.OKP;
        const crv = COSEEcCurve[jwk.crv as keyof typeof COSEEcCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEEcParam.crv, crv);
        coseMap.set(COSEEcParam.x, Buffer.from(jwk.x, 'base64url'));
        if (jwk.d) {
          coseMap.set(COSEEcParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'EC': {
        const kty = COSEKeyType.EC;
        const crv = COSEEcCurve[jwk.crv as keyof typeof COSEEcCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());
        assert(jwk.y, isString());

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEEcParam.crv, crv);
        coseMap.set(COSEEcParam.x, Buffer.from(jwk.x, 'base64url'));
        coseMap.set(COSEEcParam.y, Buffer.from(jwk.y, 'base64url'));
        if (jwk.d) {
          coseMap.set(COSEEcParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'RSA': {
        const kty = COSEKeyType.RSA;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSERsaParam.n, Buffer.from(jwk.n, 'base64url'));
        coseMap.set(COSERsaParam.e, Buffer.from(jwk.e, 'base64url'));
        if (jwk.d) {
          coseMap.set(COSERsaParam.d, Buffer.from(jwk.d, 'base64url'));
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
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEEcCurve);

    const jwk: Jwk = {};

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
          // OKP & EC params
          if (jwk.kty === 'OKP' || jwk.kty === 'EC') {
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
          if (jwk.kty === 'RSA') {
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
          // Symmetric (oct) params
          if (jwk.kty === 'oct') {
            switch (key) {
              case -1: // k (key value)
                if (Buffer.isBuffer(value)) jwk.k = value.toString('base64url');
                break;
            }
          }
      }
    }

    return jwk;
  }

  toBuffer(): Buffer {
    return encode(this.coseMap);
  }

  getCoseMap(): Map<number, string | number | Buffer> {
    return this.coseMap;
  }
}
