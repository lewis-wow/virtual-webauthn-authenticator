import type { ValueOfEnum } from '@repo/types';

/**
 * JWK Key Type Parameters.
 *
 * Defines the string keys used for algorithm-specific parameters within a JWK.
 * These are grouped by the `kty` (Key Type) they belong to.
 *
 * Note: Unlike COSE, JWK parameter names (like "d") are often reused across
 * different key types with the same string value, but are listed here
 * separately for type-strictness.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7518#section-6
 * @see https://datatracker.ietf.org/doc/html/rfc8037#section-2
 */
export const JWKKeyTypeParam = {
  // --- Key Type: EC (Elliptic Curve) [RFC 7518 s6.2] ---

  /**
   * EC: Curve (crv).
   */
  EC_crv: 'crv',

  /**
   * EC: X Coordinate (x).
   */
  EC_x: 'x',

  /**
   * EC: Y Coordinate (y).
   */
  EC_y: 'y',

  // --- Key Type: RSA [RFC 7518 s6.3] ---

  /**
   * RSA: Modulus (n).
   */
  RSA_n: 'n',

  /**
   * RSA: Public Exponent (e).
   */
  RSA_e: 'e',

  // --- Key Type: OKP (Octet Key Pair) [RFC 8037 s2] ---

  /**
   * OKP: Curve (crv).
   */
  OKP_crv: 'crv',

  /**
   * OKP: Public Key (x).
   */
  OKP_x: 'x',
} as const;

export type JWKKeyTypeParam = ValueOfEnum<typeof JWKKeyTypeParam>;
