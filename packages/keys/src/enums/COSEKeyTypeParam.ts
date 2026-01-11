import type { ValueOfEnum } from '@repo/types';

/**
 * COSE Key Type Parameters.
 *
 * Defines the integer keys used for algorithm-specific parameters within a COSE Key map.
 * These are strictly dependent on the `kty` (Key Type) value.
 *
 * Source: IANA COSE Key Type Parameters Registry.
 *
 * @see https://www.iana.org/assignments/cose/cose.xhtml#key-type-parameters
 */
export const COSEKeyTypeParam = {
  // --- Key Type 1: OKP (Octet Key Pair) ---

  /**
   * OKP: EC identifier (crv).
   * EC2: EC identifier (crv).
   */
  crv: -1,

  /**
   * OKP: Public Key (x).
   * EC2: x-coordinate (x).
   */
  x: -2,

  /**
   * EC2: y-coordinate (y).
   */
  y: -3,

  /**
   * RSA: Modulus (n).
   */
  n: -1,

  /**
   * RSA: Public exponent (e).
   */
  e: -2,
} as const;

export type COSEKeyTypeParam = ValueOfEnum<typeof COSEKeyTypeParam>;
