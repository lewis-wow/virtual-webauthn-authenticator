import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';
import {
  CoseAlgorithm,
  CoseKeyParam,
  CoseEcCurve,
  CoseEcParam,
  CoseKeyType,
  CoseRsaParam,
} from './enums/index.js';
import { getJwkAsymetricSigningAlg } from './getJwkAsymetricSigningAlg.js';
import type { Jwk } from './types.js';
import { encode, decode } from 'cbor';
import { assert, isEnum, isNumber, isString } from 'typanion';
import { objectKeys } from '@repo/utils/objectKeys';
import type { BufferLike } from '@repo/types';

export class CoseKey {
  constructor(
    private readonly coseMap = new Map<number, string | number | Buffer>(),
  ) {}

  static fromJwk(jwk: Jwk): CoseKey {
    const asymetricSigningAlgorithm = getJwkAsymetricSigningAlg(jwk);

    assert(asymetricSigningAlgorithm, isString());

    const coseAlgorithm = CoseAlgorithm[asymetricSigningAlgorithm];

    const coseMap = new Map<number, string | number | Buffer>();

    coseMap.set(CoseKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case 'OKP': {
        const kty = CoseKeyType.OKP;
        const crv = CoseEcCurve[jwk.crv as keyof typeof CoseEcCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());

        coseMap.set(CoseKeyParam.kty, kty);
        coseMap.set(CoseEcParam.crv, crv);
        coseMap.set(CoseEcParam.x, Buffer.from(jwk.x, 'base64url'));
        if (jwk.d) {
          coseMap.set(CoseEcParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'EC': {
        const kty = CoseKeyType.EC;
        const crv = CoseEcCurve[jwk.crv as keyof typeof CoseEcCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());
        assert(jwk.y, isString());

        coseMap.set(CoseKeyParam.kty, kty);
        coseMap.set(CoseEcParam.crv, crv);
        coseMap.set(CoseEcParam.x, Buffer.from(jwk.x, 'base64url'));
        coseMap.set(CoseEcParam.y, Buffer.from(jwk.y, 'base64url'));
        if (jwk.d) {
          coseMap.set(CoseEcParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'RSA': {
        const kty = CoseKeyType.RSA;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseMap.set(CoseKeyParam.kty, kty);
        coseMap.set(CoseRsaParam.n, Buffer.from(jwk.n, 'base64url'));
        coseMap.set(CoseRsaParam.e, Buffer.from(jwk.e, 'base64url'));
        if (jwk.d) {
          coseMap.set(CoseRsaParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      default:
        throw new Error(
          `Invalid JWK 'kty' parameter. Expected one of: ${objectKeys(CoseKeyType).join(', ')}.`,
        );
    }

    return new CoseKey(coseMap);
  }

  static fromBuffer(buffer: BufferLike): CoseKey {
    return new CoseKey(decode(buffer));
  }

  toJwk(): Jwk {
    const COSE_TO_JWK_KTY = swapKeysAndValues(CoseKeyType);
    const COSE_TO_JWK_ALG = swapKeysAndValues(CoseAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(CoseEcCurve);

    const jwk: Jwk = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of this.coseMap.entries()) {
      switch (key) {
        case 1: // kty
          assert(value, isEnum(Object.values(CoseKeyType)));

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
