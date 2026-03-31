import type { JsonWebKey } from '@repo/types/dom';
import { fromBase64Url, wrapIsNullish } from '@repo/utils';

import type {
  COSEPublicKey,
  COSEPublicKeyEC,
  COSEPublicKeyOKP,
  COSEPublicKeyRSA,
} from './COSEPublicKey';
import type { COSEKeyAlgorithm } from './enums/COSEKeyAlgorithm';
import { COSEKeyCurveName } from './enums/COSEKeyCurveName';
import { COSEKeyParam } from './enums/COSEKeyParam';
import { COSEKeyType } from './enums/COSEKeyType';
import { COSEKeyTypeParam } from './enums/COSEKeyTypeParam';
import { UnsupportedKeyType } from './exceptions/UnsupportedKeyType';

export const JWKPublicKeyToCOSEPublicKey = (
  JWKPublicKey: JsonWebKey,
  alg?: COSEKeyAlgorithm,
): COSEPublicKey => {
  const kty = JWKPublicKey.kty;

  const coseKey = new Map() as COSEPublicKey;

  // Set the algorithm parameter if provided
  // Per WebAuthn spec: The COSEKey-encoded credential public key MUST contain the "alg" parameter
  if (alg !== undefined) {
    coseKey.set(COSEKeyParam.alg, alg);
  }

  switch (kty) {
    case 'EC': {
      coseKey.set(COSEKeyParam.kty, COSEKeyType.EC);
      (coseKey as COSEPublicKeyEC).set(
        COSEKeyTypeParam.crv,
        COSEKeyCurveName[JWKPublicKey.crv as keyof typeof COSEKeyCurveName],
      );
      (coseKey as COSEPublicKeyEC).set(
        COSEKeyTypeParam.x,
        wrapIsNullish(fromBase64Url)(JWKPublicKey.x),
      );
      (coseKey as COSEPublicKeyEC).set(
        COSEKeyTypeParam.y,
        wrapIsNullish(fromBase64Url)(JWKPublicKey.y),
      );
      break;
    }
    case 'RSA': {
      coseKey.set(COSEKeyParam.kty, COSEKeyType.RSA);
      (coseKey as COSEPublicKeyRSA).set(
        COSEKeyTypeParam.n,
        wrapIsNullish(fromBase64Url)(JWKPublicKey.n),
      );
      (coseKey as COSEPublicKeyRSA).set(
        COSEKeyTypeParam.e,
        wrapIsNullish(fromBase64Url)(JWKPublicKey.e),
      );
      break;
    }
    case 'OKP': {
      coseKey.set(COSEKeyParam.kty, COSEKeyType.OKP);
      (coseKey as COSEPublicKeyOKP).set(
        COSEKeyTypeParam.crv,
        COSEKeyCurveName[JWKPublicKey.crv as keyof typeof COSEKeyCurveName],
      );
      (coseKey as COSEPublicKeyOKP).set(
        COSEKeyTypeParam.x,
        wrapIsNullish(fromBase64Url)(JWKPublicKey.x),
      );
      break;
    }
    default:
      throw new UnsupportedKeyType();
  }

  return coseKey;
};
