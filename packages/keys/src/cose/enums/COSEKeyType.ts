import type { ValueOfEnum } from '@repo/types';

/**
 * COSE Key Types (kty).
 *
 * Maps JSON Web Key (JWK) types and other COSE-specific key types to their
 * standard integer identifiers.
 *
 * Source: IANA COSE Key Type Parameters Registry.
 *
 * @see https://www.iana.org/assignments/cose/cose.xhtml#key-type
 */
export const COSEKeyType = {
  /**
   * This value is reserved.
   */
  Reserved: 0,

  /**
   * Octet Key Pair.
   */
  OKP: 1,

  /**
   * Elliptic Curve Keys w/ x- and y-coordinate pair.
   */
  EC2: 2,

  /**
   * Alias for EC2
   */
  EC: 2,

  /**
   * RSA Key.
   */
  RSA: 3,

  /**
   * Symmetric Keys.
   */
  Oct: 4,

  /**
   * Public key for HSS/LMS hash-based digital signature.
   */
  HSS_LMS: 5,

  /**
   * WalnutDSA public key.
   */
  WalnutDSA: 6,

  /**
   * COSE Key Type for Algorithm Key Pairs.
   */
  AKP: 7,
} as const;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;
