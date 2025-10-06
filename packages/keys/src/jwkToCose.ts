import { getJwkSigningAlg } from './getJwkSigningAlg.js';
import type { Jwk } from './types.js';
import {
  CoseAlgorithm,
  CoseEcCurve,
  CoseEcParam,
  CoseKeyParam,
  CoseKeyType,
  CoseOctParam,
  CoseRsaParam,
} from './enums/index.js';

/**
 * Converts a JSON Web Key (JWK) into a COSE Key object representation.
 *
 * This simple utility focuses on keys used for signing. The output is a
 * JavaScript object with integer keys and Buffer values, ready for CBOR encoding.
 *
 * @param jwk The JSON Web Key to convert.
 * @returns An object representing the COSE key, or undefined if conversion fails.
 */
export function jwkToCose(
  jwk: Jwk,
): Map<number, string | number | Buffer> | undefined {
  const algName = getJwkSigningAlg(jwk);
  if (!algName) {
    return undefined;
  }

  const alg = CoseAlgorithm[algName as keyof typeof CoseAlgorithm];
  if (!alg) {
    return undefined;
  }

  const coseKey = new Map<number, string | number | Buffer>();

  coseKey.set(CoseKeyParam.alg, alg);

  switch (jwk.kty) {
    case 'EC': {
      const kty = CoseKeyType.EC;
      const crv = CoseEcCurve[jwk.crv as keyof typeof CoseEcCurve];
      if (!crv || !jwk.x || !jwk.y) {
        return undefined;
      }
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
      if (!jwk.n || !jwk.e) {
        return undefined;
      }
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
      if (!jwk.k) {
        return undefined;
      }
      coseKey.set(CoseKeyParam.kty, kty);
      coseKey.set(CoseOctParam.k, Buffer.from(jwk.k, 'base64url'));
      break;
    }
    default:
      return undefined;
  }

  return coseKey;
}
