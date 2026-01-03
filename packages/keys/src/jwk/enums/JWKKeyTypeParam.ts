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

  /**
   * EC: ECC Private Key (d).
   */
  EC_d: 'd',

  // --- Key Type: RSA [RFC 7518 s6.3] ---

  /**
   * RSA: Modulus (n).
   */
  RSA_n: 'n',

  /**
   * RSA: Public Exponent (e).
   */
  RSA_e: 'e',

  /**
   * RSA: Private Exponent (d).
   */
  RSA_d: 'd',

  /**
   * RSA: First Prime Factor (p).
   */
  RSA_p: 'p',

  /**
   * RSA: Second Prime Factor (q).
   */
  RSA_q: 'q',

  /**
   * RSA: First Factor CRT Exponent (dp).
   */
  RSA_dp: 'dp',

  /**
   * RSA: Second Factor CRT Exponent (dq).
   */
  RSA_dq: 'dq',

  /**
   * RSA: First CRT Coefficient (qi).
   */
  RSA_qi: 'qi',

  /**
   * RSA: Other Primes Info (oth).
   * Value: Array of objects with r, d, t.
   */
  RSA_oth: 'oth',

  // --- Key Type: oct (Symmetric) [RFC 7518 s6.4] ---

  /**
   * Symmetric: Key Value (k).
   */
  Oct_k: 'k',

  // --- Key Type: OKP (Octet Key Pair) [RFC 8037 s2] ---

  /**
   * OKP: Curve (crv).
   */
  OKP_crv: 'crv',

  /**
   * OKP: Public Key (x).
   */
  OKP_x: 'x',

  /**
   * OKP: Private Key (d).
   */
  OKP_d: 'd',
} as const;

export type JWKKeyTypeParam = ValueOfEnum<typeof JWKKeyTypeParam>;
