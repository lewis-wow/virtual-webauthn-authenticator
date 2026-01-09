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
   * Taken from the "COSE Elliptic Curves" registry.
   */
  OKP_crv: -1,

  /**
   * OKP: Public Key (x).
   */
  OKP_x: -2,

  // --- Key Type 2: EC2 (Elliptic Curve Keys w/ x-coordinate) ---

  /**
   * EC2: EC identifier (crv).
   * Taken from the "COSE Elliptic Curves" registry.
   *
   * NOTE: EC for compatibility.
   */
  EC_crv: -1,

  /**
   * EC2: x-coordinate (x).
   *
   * NOTE: EC for compatibility.
   */
  EC_x: -2,

  /**
   * EC2: y-coordinate (y).
   * Value: bstr / bool.
   *
   * NOTE: EC for compatibility.
   */
  EC_y: -3,

  // --- Key Type 3: RSA ---

  /**
   * RSA: Modulus (n).
   */
  RSA_n: -1,

  /**
   * RSA: Public exponent (e).
   */
  RSA_e: -2,

  // --- Key Type 5: HSS-LMS ---

  /**
   * HSS-LMS: Public key (pub).
   */
  HSS_LMS_pub: -1,

  // --- Key Type 6: WalnutDSA ---

  /**
   * WalnutDSA: Group and Matrix (NxN) size (N).
   */
  WalnutDSA_N: -1,

  /**
   * WalnutDSA: Finite field F_q (q).
   */
  WalnutDSA_q: -2,

  /**
   * WalnutDSA: List of T-values, entries in F_q.
   */
  WalnutDSA_t_values: -3,

  // --- Key Type 7: Dilithium (Draft) ---

  /**
   * Dilithium: Public key (pub).
   */
  Dilithium_pub: -1,
} as const;

export type COSEKeyTypeParam = ValueOfEnum<typeof COSEKeyTypeParam>;
