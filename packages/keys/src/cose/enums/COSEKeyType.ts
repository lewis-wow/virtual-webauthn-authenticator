import type { ValueOfEnum } from '@repo/types';

import { SharedKeyType } from '../../shared/enums/SharedKeyType';

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
   *
   * NOTE: Not implemented / supported.
   */
  // [SharedKeyType.OKP]: 1,

  /**
   * Elliptic Curve Keys w/ x- and y-coordinate pair.
   * NOTE: EC is used for compatibility with JWK.
   */
  // EC2: 2,

  /**
   * Elliptic Curve Keys w/ x- and y-coordinate pair.
   * Alias for EC2.
   */
  [SharedKeyType.EC]: 2,

  /**
   * RSA Key.
   */
  [SharedKeyType.RSA]: 3,

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
} as const satisfies Record<SharedKeyType, unknown>;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;
