import type { ValueOfEnum } from '@repo/types';

import { JWKKeyType } from './JWKKeyType';

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
   *
   * NOTE: Just reserved value.
   */
  // Reserved: 0,

  /**
   * Octet Key Pair.
   * Used with curves like Ed25519 or X25519.
   */
  [JWKKeyType.OKP]: 1,

  /**
   * Elliptic Curve Keys w/ x- and y-coordinate pair.
   * NOTE: EC is used for compatibility with JWK.
   */
  // EC2: 2,

  /**
   * Elliptic Curve Keys w/ x- and y-coordinate pair.
   * Alias for EC2.
   */
  [JWKKeyType.EC]: 2,

  /**
   * RSA Key.
   */
  [JWKKeyType.RSA]: 3,

  /**
   * Symmetric Keys.
   *
   * NOTE: Not used. Is only for symmetric encryption.
   */
  // [SharedKeyType.Oct]: 4,

  /**
   * Public key for HSS/LMS hash-based digital signature.
   *
   * NOTE: Not implemented / supported.
   */
  // HSS_LMS: 5,

  /**
   * WalnutDSA public key.
   *
   * NOTE: Not implemented / supported.
   */
  // WalnutDSA: 6,

  /**
   * COSE Key Type for Algorithm Key Pairs.
   *
   * NOTE: Not implemented / supported.
   */
  // AKP: 7,
} as const satisfies Record<JWKKeyType, number>;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;
