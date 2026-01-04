import type { ValueOfEnum } from '@repo/types';

/**
 * Shared Key Types.
 *
 * Defines cryptographic key type identifiers that are common between
 * COSE (CBOR Object Signing and Encryption) and JWK (JSON Web Key).
 *
 * These key types identify the cryptographic algorithm family and are
 * supported in both standards with different representations
 * (integers in COSE, strings in JWK).
 */
export const SharedKeyType = {
  /**
   * Elliptic Curve.
   * Used with curves like P-256, P-384, P-521.
   * - COSE: 2 (EC2)
   * - JWK: 'EC'
   */
  EC: 'EC',

  /**
   * RSA.
   * Used with algorithms like RS256, PS256.
   * - COSE: 3
   * - JWK: 'RSA'
   */
  RSA: 'RSA',

  /**
   * Octet Key Pair.
   * Used with curves like Ed25519 or X25519.
   * - COSE: 1
   * - JWK: 'OKP'
   *
   * NOTE: Not implemented / supported.
   */
  // OKP: 'OKP',

  /**
   * Octet Sequence (Symmetric).
   * Used for symmetric keys (HMAC, AES).
   * - COSE: 4
   * - JWK: 'Oct'
   *
   * NOTE: Not used. Is only for symmetric encryption.
   */
  // Oct: 'Oct',
} as const;

export type SharedKeyType = ValueOfEnum<typeof SharedKeyType>;
