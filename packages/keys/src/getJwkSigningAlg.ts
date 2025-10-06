import { Buffer } from 'node:buffer';
import type { Jwk } from './types.js';
import type { CoseAlgorithm } from './enums/index.js';

/**
 * Infers a JWS signing algorithm ('alg') from a JSON Web Key (JWK).
 *
 * @param jwk The JSON Web Key object.
 * @returns The inferred signing algorithm string (e.g., 'ES256', 'PS256') or undefined if it cannot be determined.
 */
export const getJwkSigningAlg = (
  jwk: Jwk,
): keyof typeof CoseAlgorithm | undefined => {
  // 1. If 'alg' is explicitly provided, it has the highest priority.
  if (jwk.alg) {
    return jwk.alg as keyof typeof CoseAlgorithm;
  }

  // 2. Infer algorithm based on key type ('kty').
  switch (jwk.kty) {
    case 'EC':
      switch (jwk.crv) {
        case 'P-256':
          return 'ES256';
        case 'P-384':
          return 'ES384';
        case 'P-521':
          return 'ES512';
        // case 'secp256k1':
        //   return 'ES256K';
        case 'Ed25519':
        case 'Ed448':
          return 'EdDSA';
        default:
          return undefined;
      }

    case 'RSA':
      // Use PS256 as a secure, modern default for RSA signing.
      return 'PS256';

    case 'oct':
      // For symmetric keys, infer the HMAC algorithm from key size.
      if (jwk.k) {
        const keyBitLength = Buffer.from(jwk.k, 'base64url').length * 8;
        if (keyBitLength >= 512) return 'HS512';
        if (keyBitLength >= 384) return 'HS384';
      }
      // Default to HS256 if key size is unknown or smaller.
      return 'HS256';

    default:
      return undefined;
  }
};
