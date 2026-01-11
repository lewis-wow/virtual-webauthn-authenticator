import type { ValueOfEnum } from '@repo/types';

/**
 * COSE Key Common Parameters.
 *
 * Defines the integer keys used for the common parameters in a COSE Key map.
 *
 * @see https://www.iana.org/assignments/cose/cose.xhtml#key-common-parameters
 */
export const COSEKeyParam = {
  /**
   * Key Type (kty).
   * Identification of the key type.
   */
  kty: 1,

  /**
   * Key Identifier (kid).
   * Key identification value - match to kid in message.
   */
  kid: 2,

  /**
   * Algorithm (alg).
   * Key usage restriction to this algorithm.
   */
  alg: 3,

  /**
   * Key Operations (key_ops).
   * Restrict set of permissible operations.
   */
  key_ops: 4,

  /**
   * Base Initialization Vector (Base IV).
   * Base IV to be XORed with Partial IVs.
   */
  base_iv: 5,

  /**
   * Reserved.
   * Value: 0
   */
  // Reserved: 0,

  /*
   * NOTE: Key Parameters specific to a single algorithm (delegated to the
   * COSE Key Type Parameters registry) use the range:
   * -1 to -65536
   */

  /*
   * NOTE: Reserved for Private Use:
   * Less than -65536
   */
} as const;

export type COSEKeyParam = ValueOfEnum<typeof COSEKeyParam>;
