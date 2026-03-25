import type { JsonWebKey } from '@repo/types/dom';
import { swapKeysAndValues, toBase64Url, wrapIsNullish } from '@repo/utils';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from './COSEPublicKey';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from './exceptions/UnsupportedKeyType';

const CURVE_NAME_MAP = swapKeysAndValues(COSEKeyCurveName);

export const COSEPublicKeyToJWKPublicKey = (
  COSEPublicKey: COSEPublicKey,
): JsonWebKey => {
  const kty = COSEPublicKey.get(COSEKeyParam.kty);

  const jwk: JsonWebKey = {};

  switch (kty) {
    case COSEKeyType.EC: {
      jwk.kty = 'EC';
      const COSEPublicKeyEC = COSEPublicKey as COSEPublicKeyEC;

      jwk.crv = CURVE_NAME_MAP[COSEPublicKeyEC.get(COSEKeyTypeParam.crv)!];
      jwk.x = wrapIsNullish(toBase64Url)(
        COSEPublicKeyEC.get(COSEKeyTypeParam.x),
      );
      jwk.y = wrapIsNullish(toBase64Url)(
        COSEPublicKeyEC.get(COSEKeyTypeParam.y),
      );
      break;
    }
    case COSEKeyType.RSA: {
      jwk.kty = 'RSA';
      const COSEPublicKeyRSA = COSEPublicKey as COSEPublicKeyRSA;

      jwk.n = wrapIsNullish(toBase64Url)(
        COSEPublicKeyRSA.get(COSEKeyTypeParam.n),
      );
      jwk.e = wrapIsNullish(toBase64Url)(
        COSEPublicKeyRSA.get(COSEKeyTypeParam.e),
      );
      break;
    }
    case COSEKeyType.OKP: {
      jwk.kty = 'OKP';
      const COSEPublicKeyOKP = COSEPublicKey as COSEPublicKeyOKP;

      jwk.crv = CURVE_NAME_MAP[COSEPublicKeyOKP.get(COSEKeyTypeParam.crv)!];
      jwk.x = wrapIsNullish(toBase64Url)(
        COSEPublicKeyOKP.get(COSEKeyTypeParam.x),
      );
      break;
    }
    default:
      throw new UnsupportedKeyType();
  }

  return jwk;
};
