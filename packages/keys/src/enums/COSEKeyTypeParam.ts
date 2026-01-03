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

  /**
   * OKP: Private key (d).
   */
  OKP_d: -4,

  // --- Key Type 2: EC2 (Elliptic Curve Keys w/ x-coordinate) ---

  /**
   * EC2: EC identifier (crv).
   * Taken from the "COSE Elliptic Curves" registry.
   */
  EC2_crv: -1,

  /**
   * EC2: x-coordinate (x).
   */
  EC2_x: -2,

  /**
   * EC2: y-coordinate (y).
   * Value: bstr / bool.
   */
  EC2_y: -3,

  /**
   * EC2: Private key (d).
   */
  EC2_d: -4,

  // --- Key Type 3: RSA ---

  /**
   * RSA: Modulus (n).
   */
  RSA_n: -1,

  /**
   * RSA: Public exponent (e).
   */
  RSA_e: -2,

  /**
   * RSA: Private exponent (d).
   */
  RSA_d: -3,

  /**
   * RSA: Prime factor p of n (p).
   */
  RSA_p: -4,

  /**
   * RSA: Prime factor q of n (q).
   */
  RSA_q: -5,

  /**
   * RSA: dP is d mod (p - 1).
   */
  RSA_dP: -6,

  /**
   * RSA: dQ is d mod (q - 1).
   */
  RSA_dQ: -7,

  /**
   * RSA: qInv is the CRT coefficient q^(-1) mod p.
   */
  RSA_qInv: -8,

  /**
   * RSA: Other prime infos (other).
   * Value: Array of maps.
   */
  RSA_other: -9,

  /**
   * RSA: A prime factor r_i of n, where i >= 3.
   */
  RSA_ri: -10,

  /**
   * RSA: d_i = d mod (r_i - 1).
   */
  RSA_di: -11,

  /**
   * RSA: The CRT coefficient t_i = (r_1 * ... * r_(i-1))^(-1) mod r_i.
   */
  RSA_ti: -12,

  // --- Key Type 4: Symmetric ---

  /**
   * Symmetric: Key Value (k).
   */
  Symmetric_k: -1,

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

  /**
   * WalnutDSA: NxN Matrix of entries in F_q in column-major form (matrix 1).
   */
  WalnutDSA_matrix_1: -4,

  /**
   * WalnutDSA: Permutation associated with matrix 1 (permutation 1).
   */
  WalnutDSA_permutation_1: -5,

  /**
   * WalnutDSA: NxN Matrix of entries in F_q in column-major form (matrix 2).
   */
  WalnutDSA_matrix_2: -6,

  // --- Key Type 7: Dilithium (Draft) ---

  /**
   * Dilithium: Public key (pub).
   */
  Dilithium_pub: -1,

  /**
   * Dilithium: Private key (priv).
   */
  Dilithium_priv: -2,
} as const;

export type COSEKeyTypeParam = ValueOfEnum<typeof COSEKeyTypeParam>;
