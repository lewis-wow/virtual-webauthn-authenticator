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
import { objectKeys, swapKeysAndValues } from '@repo/utils';
import * as cbor from 'cbor';
import { assert, isEnum, isNumber, isString } from 'typanion';

import { JsonWebKey, type JsonWebKeyOptions } from './JsonWebKey';

export class COSEKey {
  constructor(
    public readonly coseMap = new Map<number, string | number | Uint8Array>(),
  ) {}

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

  static fromBuffer(buffer: BufferLike): COSEKey {
    return new COSEKey(cbor.decode(buffer));
  }

  toJwk(opts?: { keepAlg?: boolean }): JsonWebKey {
    const keepAlgOption = opts?.keepAlg ?? false;

    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_ALG = swapKeysAndValues(COSEKeyAlgorithm);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurve);

    const jwk: JsonWebKeyOptions = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of this.coseMap.entries()) {
      switch (key) {
        case COSEKeyParam.kty: // kty
          assert(value, isEnum(COSEKeyType));

          jwk.kty = COSE_TO_JWK_KTY[value];
          break;
        case COSEKeyParam.alg: // alg
          assert(value, isEnum(COSEKeyAlgorithm));

          if (keepAlgOption) {
            jwk.alg = COSE_TO_JWK_ALG[value];
          }
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

  toBuffer(): Buffer {
    return cbor.encode(this.coseMap);
  }
}
