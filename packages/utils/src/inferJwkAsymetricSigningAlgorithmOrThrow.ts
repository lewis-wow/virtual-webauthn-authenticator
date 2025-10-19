import { AsymetricSigningAlgorithm } from '@repo/enums';
import { objectKeys } from '@repo/utils/objectKeys';
import type { JsonWebKey } from 'node:crypto';
import { assert, isEnum, isOptional } from 'typanion';

/**
 * Infers a JWS signing algorithm ('alg') from a JSON Web Key (JWK).
 *
 * - `RSA`: `PS256`, `PS384`, `PS512`, `RS256`, `RS384`, `RS512`
 * - `EC`: `ES256`, `ES384`, `ES512`, `ES256K`
 * - `OKP`: `EdDSA`
 *
 * @param jwk The JSON Web Key object.
 * @returns The inferred signing algorithm string (e.g., 'ES256', 'PS256') or undefined if it cannot be determined.
 */
export const inferJwkAsymetricSigningAlgorithmOrThrow = (
  jwk: Pick<JsonWebKey, 'kty' | 'crv'> & { alg?: AsymetricSigningAlgorithm },
): AsymetricSigningAlgorithm => {
  assert(jwk.alg, isOptional(isEnum(objectKeys(AsymetricSigningAlgorithm))));

  // If 'alg' is explicitly provided, it has the highest priority.
  if (jwk.alg) {
    return jwk.alg;
  }

  // Infer algorithm based on key type ('kty').
  switch (jwk.kty) {
    // Octet Key Pair
    case 'OKP':
      // `OKP`: `EdDSA`
      switch (jwk.crv) {
        case 'Ed25519':
        case 'Ed448':
          return 'EdDSA';
        default:
          throw new Error(
            `Cannot infer asymetric signing algorithm for kty: ${jwk.kty}, crv: ${jwk.crv}.`,
          );
      }

    // Elliptic Curve Keys w/ x- and y-coordinate pair
    case 'EC':
      // `EC`: `ES256`, `ES384`, `ES512`, `ES256K`
      switch (jwk.crv) {
        // secp256r1
        case 'P-256':
          return 'ES256';
        // secp384r1
        case 'P-384':
          return 'ES384';
        // secp521r1
        case 'P-521':
          return 'ES512';
        case 'secp256k1':
        default:
          throw new Error(
            `Cannot infer asymetric signing algorithm for kty: ${jwk.kty}, crv: ${jwk.crv}.`,
          );
      }

    case 'RSA':
      // PS512
      // PS384

      // RSASSA-PSS w/ SHA-256
      return 'PS256';

    default:
      throw new Error(
        `Cannot infer asymetric signing algorithm for kty: ${jwk.kty}.`,
      );
  }
};
