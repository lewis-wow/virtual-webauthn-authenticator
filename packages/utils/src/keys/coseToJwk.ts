import { Buffer } from 'node:buffer';
import type { Jwk } from '../types.js';

const COSE_TO_JWK_KTY = {
  1: 'OKP', // Octet Key Pair
  2: 'EC', // Elliptic Curve
  3: 'RSA', // RSA
  4: 'oct', // Symmetric
} as const;

const COSE_TO_JWK_ALG: Record<number, string> = {
  // ECDSA
  '-7': 'ES256',
  '-35': 'ES384',
  '-36': 'ES512',
  // EdDSA
  '-8': 'EdDSA',
  // RSASSA-PSS
  '-37': 'PS256',
  '-38': 'PS384',
  '-39': 'PS512',
  // RSASSA-PKCS1-v1_5
  '-257': 'RS256',
  '-258': 'RS384',
  '-259': 'RS512',
  // HMAC
  5: 'HS256',
  6: 'HS384',
  7: 'HS512',
} as const;

const COSE_TO_JWK_CRV: Record<number, string> = {
  // For EC Keys
  1: 'P-256',
  2: 'P-384',
  3: 'P-521',
  // For OKP Keys
  6: 'Ed25519',
  7: 'Ed448',
} as const;

/**
 * Converts a COSE Key from a CBOR Buffer into a JWK (JSON Web Key) object.
 */
export const coseToJwk = (
  coseMap: Map<number, string | number | Buffer>,
): Jwk => {
  const jwk: Jwk = {};

  // First, determine the key type (kty), as it's essential for parsing other fields.
  const ktyInt = coseMap.get(1); // 1 = kty
  const ktyStr = COSE_TO_JWK_KTY[ktyInt as keyof typeof COSE_TO_JWK_KTY];
  if (!ktyStr) {
    throw new Error(`Unsupported or missing COSE kty: ${ktyInt}`);
  }
  jwk.kty = ktyStr;

  // Iterate over the rest of the COSE key parameters
  for (const [key, value] of coseMap.entries()) {
    switch (key) {
      case 1: // kty
        // Already handled
        break;
      case 3: // alg
        jwk.alg = COSE_TO_JWK_ALG[value as number];
        break;

      // Key-specific parameters
      default:
        // OKP & EC params
        if (jwk.kty === 'OKP' || jwk.kty === 'EC') {
          switch (key) {
            case -1: // crv
              jwk.crv = COSE_TO_JWK_CRV[value as number];
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
};
