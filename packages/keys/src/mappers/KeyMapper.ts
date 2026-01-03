import { KeyType } from '../___enums/KeyType';

import { assertSchema } from '@repo/assert';
import { swapKeysAndValues } from '@repo/utils';
import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras';
import z from 'zod';

import { COSEKey } from '../cose/COSEKey';
import { COSEKeyAlgorithm } from '../cose/enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from '../cose/enums/COSEKeyCurveName';
import { COSEKeyParam } from '../cose/enums/COSEKeyParam';
import { COSEKeyType } from '../cose/enums/COSEKeyType';
import { COSEKeyTypeParam } from '../cose/enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from '../exceptions/UnsupportedKeyType';
import { JsonWebKey, type JsonWebKeyOptions } from '../jwk/JsonWebKey';
import { JWKKeyCurveName } from '../jwk/enums/JWKKeyCurveName';
import { COSEKeyCurveSchema, COSEKeyTypeSchema } from '../zod-validation';

export class KeyMapper {
  static JWKToCOSE(jwk: JsonWebKey): COSEKey {
    const alg = jwk.getAlg();
    assertSchema(alg, z.enum(swapKeysAndValues(COSEKeyAlgorithm)));

    const coseAlgorithm = COSEKeyAlgorithm[alg];

    const coseMap = new Map<number, number | Uint8Array>();

    coseMap.set(COSEKeyParam.alg, coseAlgorithm);

    switch (jwk.kty) {
      case KeyType.EC: {
        const kty = jwk.kty;
        assertSchema(jwk.crv, z.enum(JWKKeyCurveName));
        const crv = COSEKeyCurveName[jwk.crv];

        assertSchema(crv, z.number());
        assertSchema(jwk.x, z.string());
        assertSchema(jwk.y, z.string());

        coseMap.set(COSEKeyParam.kty, COSEKeyType[kty]);
        coseMap.set(COSEKeyTypeParam.EC2_crv, crv);
        coseMap.set(COSEKeyTypeParam.EC2_x, base64ToUint8Array(jwk.x));
        coseMap.set(COSEKeyTypeParam.EC2_y, base64ToUint8Array(jwk.y));
        if (jwk.d)
          coseMap.set(COSEKeyTypeParam.EC2_d, base64ToUint8Array(jwk.d));
        break;
      }
      case KeyType.RSA: {
        const kty = jwk.kty;

        assertSchema(jwk.n, z.string());
        assertSchema(jwk.e, z.string());

        coseMap.set(COSEKeyParam.kty, COSEKeyType[kty]);
        coseMap.set(COSEKeyTypeParam.RSA_n, base64ToUint8Array(jwk.n));
        coseMap.set(COSEKeyTypeParam.RSA_e, base64ToUint8Array(jwk.e));
        if (jwk.d)
          coseMap.set(COSEKeyTypeParam.RSA_d, base64ToUint8Array(jwk.d));
        break;
      }
      default:
        throw new UnsupportedKeyType();
    }

    return new COSEKey(coseMap);
  }

  static COSEToJWK(coseKey: COSEKey): JsonWebKey {
    const COSE_TO_JWK_KTY = swapKeysAndValues(COSEKeyType);
    const COSE_TO_JWK_CRV = swapKeysAndValues(COSEKeyCurveName);

    const jwk: JsonWebKeyOptions = {};

    // Iterate over the rest of the COSE key parameters
    for (const [key, value] of coseKey.map.entries()) {
      switch (key) {
        case COSEKeyParam.kty: // kty
          assertSchema(value, COSEKeyTypeSchema);

          jwk.kty = COSE_TO_JWK_KTY[value];
          break;

        // Key-specific parameters
        default:
          // EC params
          if (jwk.kty === KeyType.EC) {
            switch (key) {
              case COSEKeyTypeParam.EC2_crv: // crv
                assertSchema(value, COSEKeyCurveSchema);

                jwk.crv = COSE_TO_JWK_CRV[value];
                break;
              case COSEKeyTypeParam.EC2_x: // x
                if (value instanceof Uint8Array)
                  jwk.x = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyTypeParam.EC2_y: // y
                if (value instanceof Uint8Array)
                  jwk.y = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyTypeParam.EC2_d: // d (private key)
                if (value instanceof Uint8Array)
                  jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
                break;
            }
          }
          // RSA params
          if (jwk.kty === KeyType.RSA) {
            switch (key) {
              case COSEKeyTypeParam.RSA_n: // n (modulus)
                if (value instanceof Uint8Array)
                  jwk.n = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyTypeParam.RSA_e: // e (exponent)
                if (value instanceof Uint8Array)
                  jwk.e = uint8ArrayToBase64(value, { urlSafe: true });
                break;
              case COSEKeyTypeParam.RSA_d: // d (private key)
                if (value instanceof Uint8Array)
                  jwk.d = uint8ArrayToBase64(value, { urlSafe: true });
                break;
            }
          }
      }
    }

    return new JsonWebKey(jwk);
  }
}
