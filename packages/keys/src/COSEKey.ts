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
import { Buffer } from 'node:buffer';
import { assert, isEnum, isInstanceOf, isNumber } from 'typanion';

import type { JsonWebKey } from './JsonWebKey';

export class COSEKey {
  constructor(
    private readonly coseMap = new Map<number, number | Uint8Array>(),
  ) {}

  static fromJwk(jwk: JsonWebKey): COSEKey {
    assert(jwk.alg, isEnum(Object.values(KeyAlgorithm)));

    const coseKeyAlgorithm = COSEKeyAlgorithm[jwk.alg];

    const coseMap = new Map<number, number | Uint8Array>();

    coseMap.set(COSEKeyParam.alg, coseKeyAlgorithm);

    switch (jwk.kty) {
      case 'EC': {
        const kty = COSEKeyType.EC;
        const crv = COSEKeyCurve[jwk.crv as keyof typeof COSEKeyCurve];

        assert(crv, isNumber());
        assert(jwk.x, isInstanceOf(Uint8Array));
        assert(jwk.y, isInstanceOf(Uint8Array));

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyCurveParam.crv, crv);
        coseMap.set(COSEKeyCurveParam.x, jwk.x);
        coseMap.set(COSEKeyCurveParam.y, jwk.y);
        if (jwk.d !== undefined) {
          coseMap.set(COSEKeyCurveParam.d, jwk.d);
        }
        break;
      }
      case 'RSA': {
        const kty = COSEKeyType.RSA;

        assert(jwk.n, isInstanceOf(Uint8Array));
        assert(jwk.e, isInstanceOf(Uint8Array));

        coseMap.set(COSEKeyParam.kty, kty);
        coseMap.set(COSEKeyRsaParam.n, jwk.n);
        coseMap.set(COSEKeyRsaParam.e, jwk.e);
        if (jwk.d !== undefined) {
          coseMap.set(COSEKeyRsaParam.d, jwk.d);
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

  toJwk(): JsonWebKey {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: Partial<JsonWebKey> = {};

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
          if (jwk.kty === KeyType.EC || jwk.kty === KeyType.EC_HSM) {
            switch (key) {
              case -1: // crv
                jwk.crv =
                  COSE_TO_JWK_CRV[value as keyof typeof COSE_TO_JWK_CRV];
                break;
              case -2: // x
                if (value instanceof Uint8Array) jwk.x = value;
                break;
              case -3: // y
                if (value instanceof Uint8Array) jwk.y = value;
                break;
              case -4: // d (private key)
                if (value instanceof Uint8Array) jwk.d = value;
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA || jwk.kty === KeyType.RSA_HSM) {
            switch (key) {
              case -1: // n (modulus)
                if (value instanceof Uint8Array) jwk.n = value;
                break;
              case -2: // e (exponent)
                if (value instanceof Uint8Array) jwk.e = value;
                break;
              case -3: // d (private key)
                if (value instanceof Uint8Array) jwk.d = value;
                break;
            }
          }
      }
    }

    return jwk as JsonWebKey;
  }

  toBuffer(): Buffer {
    return encode(this.coseMap);
  }

  getCoseMap(): Map<number, number | Uint8Array> {
    return this.coseMap;
  }

  /**
   * Get the key type (kty).
   * @returns The COSEKeyType enum value or undefined if not present.
   */
  getKty(): COSEKeyType | undefined {
    const kty = this.coseMap.get(COSEKeyParam.kty) as number | undefined;
    if (kty === undefined) return undefined;

    assert(kty, isEnum(Object.values(COSEKeyType)));
    return kty;
  }

  /**
   * Get the algorithm (alg).
   * @returns The COSEKeyAlgorithm enum value or undefined if not present.
   */
  getAlg(): COSEKeyAlgorithm | undefined {
    const alg = this.coseMap.get(COSEKeyParam.alg) as number | undefined;
    if (alg === undefined) return undefined;

    assert(alg, isEnum(Object.values(COSEKeyAlgorithm)));
    return alg;
  }

  /**
   * Get the elliptic curve (crv) for EC or OKP keys.
   * @returns The COSEKeyCurve enum value or undefined if not present.
   */
  getCrv(): COSEKeyCurve | undefined {
    const crv = this.coseMap.get(COSEKeyCurveParam.crv) as number | undefined;
    if (crv === undefined) return undefined;

    assert(crv, isEnum(Object.values(COSEKeyCurve)));
    return crv;
  }

  /**
   * Get the x-coordinate for EC or OKP keys.
   * @returns A Buffer containing the x-coordinate or undefined if not present.
   */
  getX(): Uint8Array | undefined {
    const x = this.coseMap.get(COSEKeyCurveParam.x) as Uint8Array | undefined;
    return x;
  }

  /**
   * Get the y-coordinate for EC keys.
   * @returns A Buffer containing the y-coordinate or undefined if not present.
   */
  getY(): Uint8Array | undefined {
    const y = this.coseMap.get(COSEKeyCurveParam.y) as Uint8Array | undefined;
    return y;
  }

  /**
   * Get the private key component (d).
   * This method handles the different numeric keys for EC/OKP vs. RSA.
   * @returns A Buffer containing the private key data or undefined if not present.
   */
  getD(): Uint8Array | undefined {
    const kty = this.getKty();
    let d: Uint8Array | undefined;

    if (kty === COSEKeyType[KeyType.EC]) {
      d = this.coseMap.get(COSEKeyCurveParam.d) as Uint8Array | undefined;
    } else if (kty === COSEKeyType.RSA) {
      d = this.coseMap.get(COSEKeyRsaParam.d) as Uint8Array | undefined;
    }

    return d;
  }

  /**
   * Get the modulus (n) for an RSA key.
   * @returns A Buffer containing the modulus or undefined if not present.
   */
  getN(): Uint8Array | undefined {
    const n = this.coseMap.get(COSEKeyRsaParam.n) as Uint8Array | undefined;
    return n;
  }

  /**
   * Get the public exponent (e) for an RSA key.
   * @returns A Buffer containing the public exponent or undefined if not present.
   */
  getE(): Uint8Array | undefined {
    const e = this.coseMap.get(COSEKeyRsaParam.e) as Uint8Array | undefined;
    return e;
  }
}
