import type { ValueOfEnum } from '@repo/types';

import { JWKKeyAlgorithm } from './JWKKeyAlgorithm';

/**
 * COSE Algorithm Identifiers (alg).
 *
 * Defines the standard integer identifiers for cryptographic algorithms used in
 * WebAuthn, COSE, and CWT.
 *
 * Source: IANA COSE Algorithms Registry (as of provided snapshot).
 *
 * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
 */
export const COSEKeyAlgorithm = {
  /**
   * ECDSA w/ SHA-256.
   * Status: Deprecated (in some contexts, but widely used in WebAuthn).
   */
  [JWKKeyAlgorithm.ES256]: -7,

  /**
   * EdDSA (Ed25519).
   * Used with OKP keys on Ed25519 curve.
   */
  [JWKKeyAlgorithm.EdDSA]: -8,

  /**
   * ECDSA w/ SHA-384.
   * Status: Deprecated (in IETF context).
   */
  [JWKKeyAlgorithm.ES384]: -35,

  /**
   * ECDSA w/ SHA-512.
   * Status: Deprecated (in IETF context).
   */
  [JWKKeyAlgorithm.ES512]: -36,

  /**
   * RSASSA-PSS w/ SHA-256.
   */
  [JWKKeyAlgorithm.PS256]: -37,

  /**
   * RSASSA-PSS w/ SHA-384.
   */
  [JWKKeyAlgorithm.PS384]: -38,

  /**
   * RSASSA-PSS w/ SHA-512.
   */
  [JWKKeyAlgorithm.PS512]: -39,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-256.
   * Status: No (IESG).
   */
  [JWKKeyAlgorithm.RS256]: -257,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-384.
   * Status: No (IESG).
   */
  [JWKKeyAlgorithm.RS384]: -258,

  /**
   * RSASSA-PKCS1-v1_5 using SHA-512.
   * Status: No (IESG).
   */
  [JWKKeyAlgorithm.RS512]: -259,
} as const satisfies Record<JWKKeyAlgorithm, number>;

export type COSEKeyAlgorithm = ValueOfEnum<typeof COSEKeyAlgorithm>;
