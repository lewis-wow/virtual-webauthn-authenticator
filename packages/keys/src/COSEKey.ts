import { objectKeys, swapKeysAndValues } from '@repo/utils';
import { Buffer } from 'buffer';
import * as cbor from 'cbor-x';
import { assert, isEnum, isInstanceOf, isNumber, isString } from 'typanion';

import { JsonWebKey, type JsonWebKeyOptions } from './JsonWebKey';
import { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurve } from './enums/COSEKeyCurve';
import { COSEKeyCurveParam } from './enums/COSEKeyCurveParam';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyRsaParam } from './enums/COSEKeyRsaParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { KeyAlgorithm } from './enums/KeyAlgorithm';
import { KeyType } from './enums/KeyType';
import { CannotParseCOSEKey } from './exceptions/CannotParseCOSEKey';

export class COSEKey {
  readonly map: Map<number, string | number | Uint8Array>;

  constructor(map: Map<number, string | number | Uint8Array>) {
    if (!COSEKey.canParse(map)) {
      throw new CannotParseCOSEKey();
    }

    this.map = map;
  }

  static fromJwk(jwk: JsonWebKey): COSEKey {
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

  static fromBytes(buffer: Uint8Array): COSEKey {
    return new COSEKey(cbor.decode(buffer));
  }

  toJwk(): JsonWebKey {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: JsonWebKeyOptions = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of this.map.entries()) {
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

  toBytes(): Uint8Array {
    return cbor.encode(this.map);
  }

  public static canParse(
    map: Map<number, string | number | Uint8Array>,
  ): boolean {
    try {
      const kty = map.get(COSEKeyParam.kty);
      assert(kty, isEnum(COSEKeyType));

      const alg = map.get(COSEKeyParam.alg);
      assert(alg, isEnum(COSEKeyAlgorithm));

      switch (kty) {
        case COSEKeyType.EC: {
          const crv = map.get(COSEKeyCurveParam.crv);
          assert(crv, isEnum(COSEKeyCurve));

          const x = map.get(COSEKeyCurveParam.x);
          assert(x, isInstanceOf(Uint8Array));

          const y = map.get(COSEKeyCurveParam.y);
          assert(y, isInstanceOf(Uint8Array));
          break;
        }
        case COSEKeyType.RSA: {
          const n = map.get(COSEKeyRsaParam.n);
          assert(n, isInstanceOf(Uint8Array));

          const e = map.get(COSEKeyRsaParam.e);
          assert(e, isInstanceOf(Uint8Array));
          break;
        }
        default:
          // This should be unreachable due to the first `assert(kty, ...)`
          // NOTE: This should not be a `HTTPException`, as this should be completely unreachable.
          throw new Error(`Unsupported kty: ${kty}`);
      }

      return true;
    } catch {
      return false;
    }
  }
}
