import { swapKeysAndValues } from '@repo/utils/swapKeysAndValues';
import {
  CoseAlgorithm,
  CoseKeyParam,
  CoseEcCurve,
  CoseEcParam,
  CoseKeyType,
  CoseOctParam,
  CoseRsaParam,
} from './enums/index.js';
import { getJwkSigningAlg } from './getJwkSigningAlg.js';
import type { Jwk } from './types.js';
import { encode, decode } from 'cbor';
import { assert, isEnum, isNumber, isString } from 'typanion';
import { objectKeys } from '@repo/utils/objectKeys';

export class CoseKey {
  constructor(
    private readonly coseMap = new Map<number, string | number | Buffer>(),
  ) {}

  static fromJwk(jwk: Jwk): CoseKey {
    const algName = getJwkSigningAlg(jwk);

    assert(algName, isEnum(objectKeys(CoseAlgorithm)));

    const alg = CoseAlgorithm[algName as keyof typeof CoseAlgorithm];

    const coseKey = new Map<number, string | number | Buffer>();

    coseKey.set(CoseKeyParam.alg, alg);

    switch (jwk.kty) {
      case 'EC': {
        const kty = CoseKeyType.EC;
        const crv = CoseEcCurve[jwk.crv as keyof typeof CoseEcCurve];

        assert(crv, isNumber());
        assert(jwk.x, isString());
        assert(jwk.y, isString());

        coseKey.set(CoseKeyParam.kty, kty);
        coseKey.set(CoseEcParam.crv, crv);
        coseKey.set(CoseEcParam.x, Buffer.from(jwk.x, 'base64url'));
        coseKey.set(CoseEcParam.y, Buffer.from(jwk.y, 'base64url'));
        if (jwk.d) {
          coseKey.set(CoseEcParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'RSA': {
        const kty = CoseKeyType.RSA;

        assert(jwk.n, isString());
        assert(jwk.e, isString());

        coseKey.set(CoseKeyParam.kty, kty);
        coseKey.set(CoseRsaParam.n, Buffer.from(jwk.n, 'base64url'));
        coseKey.set(CoseRsaParam.e, Buffer.from(jwk.e, 'base64url'));
        if (jwk.d) {
          coseKey.set(CoseRsaParam.d, Buffer.from(jwk.d, 'base64url'));
        }
        break;
      }
      case 'oct': {
        const kty = CoseKeyType.oct;

        assert(jwk.k, isString());

        coseKey.set(CoseKeyParam.kty, kty);
        coseKey.set(CoseOctParam.k, Buffer.from(jwk.k, 'base64url'));
        break;
      }
      default:
        throw new Error(
          `Invalid JWK 'kty' parameter. Expected one of: ${objectKeys(CoseKeyType).join(', ')}.`,
        );
    }

    return new CoseKey(coseKey);
  }

  static fromBuffer(buffer: Buffer): CoseKey {
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
