import { getJwkSigningAlg } from './getJwkSigningAlg.js';
import type { Jwk } from '../types.js';

const COSE_KEY_TYPES = { EC: 2, RSA: 3, oct: 4 } as const;

const COSE_ALGORITHMS = {
  ES256: -7,
  ES384: -35,
  ES512: -36,
  EdDSA: -8,
  PS256: -37,
  HS256: 5,
  HS384: 6,
  HS512: 7,
} as const;

const COSE_EC_CURVES = {
  'P-256': 1,
  'P-384': 2,
  'P-521': 3,
  Ed25519: 6,
} as const;

// COSE Key Common Parameters
const COSE_KEY_PARAM = { kty: 1, alg: 3 } as const;
// COSE EC Key Parameters
const COSE_EC_PARAM = { crv: -1, x: -2, y: -3, d: -4 } as const;
// COSE RSA Key Parameters
const COSE_RSA_PARAM = { n: -1, e: -2, d: -3 } as const;
// COSE Symmetric Key Parameters
const COSE_OCT_PARAM = { k: -1 } as const;

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

  const alg = COSE_ALGORITHMS[algName as keyof typeof COSE_ALGORITHMS];
  if (!alg) {
    return undefined;
  }

  const coseKey = new Map<number, string | number | Buffer>();

  coseKey.set(COSE_KEY_PARAM.alg, alg);

  switch (jwk.kty) {
    case 'EC': {
      const kty = COSE_KEY_TYPES.EC;
      const crv = COSE_EC_CURVES[jwk.crv as keyof typeof COSE_EC_CURVES];
      if (!crv || !jwk.x || !jwk.y) {
        return undefined;
      }
      coseKey.set(COSE_KEY_PARAM.kty, kty);
      coseKey.set(COSE_EC_PARAM.crv, crv);
      coseKey.set(COSE_EC_PARAM.x, Buffer.from(jwk.x, 'base64url'));
      coseKey.set(COSE_EC_PARAM.y, Buffer.from(jwk.y, 'base64url'));
      if (jwk.d) {
        coseKey.set(COSE_EC_PARAM.d, Buffer.from(jwk.d, 'base64url'));
      }
      break;
    }
    case 'RSA': {
      const kty = COSE_KEY_TYPES.RSA;
      if (!jwk.n || !jwk.e) {
        return undefined;
      }
      coseKey.set(COSE_KEY_PARAM.kty, kty);
      coseKey.set(COSE_RSA_PARAM.n, Buffer.from(jwk.n, 'base64url'));
      coseKey.set(COSE_RSA_PARAM.e, Buffer.from(jwk.e, 'base64url'));
      if (jwk.d) {
        coseKey.set(COSE_RSA_PARAM.d, Buffer.from(jwk.d, 'base64url'));
      }
      break;
    }
    case 'oct': {
      const kty = COSE_KEY_TYPES.oct;
      if (!jwk.k) {
        return undefined;
      }
      coseKey.set(COSE_KEY_PARAM.kty, kty);
      coseKey.set(COSE_OCT_PARAM.k, Buffer.from(jwk.k, 'base64url'));
      break;
    }
    default:
      return undefined;
  }

  return coseKey;
}
