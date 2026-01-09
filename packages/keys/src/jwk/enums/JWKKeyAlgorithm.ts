import type { ValueOfEnum } from '@repo/types';

import { SharedKeyAlgorithm } from '../../shared/enums/SharedKeyAlgorithm';

/**
 * JSON Web Algorithms (alg).
 *
 * Defines the standard string identifiers for cryptographic algorithms used in JWS.
 * The implementation requirements are based on RFC 7518.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7518#section-3.1
 */
export const JWKKeyAlgorithm = {
  /**
   * HMAC using SHA-256.
   * Implementation: Required (for JWS conformance)
   * Note: This is a symmetric algorithm, not used for public key (asymmetric) signing.
   */
  // HS256: 'HS256',

  /**
   * HMAC using SHA-384.
   * Implementation: Optional (for JWS conformance)
   * Note: This is a symmetric algorithm, not used for public key (asymmetric) signing.
   */
  // HS384: 'HS384',

  /**
   * HMAC using SHA-512.
   * Implementation: Optional (for JWS conformance)
   * Note: This is a symmetric algorithm, not used for public key (asymmetric) signing.
   */
  // HS512: 'HS512',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-256.
   * Implementation: Recommended (for JWS conformance)
   */
  [SharedKeyAlgorithm.RS256]: SharedKeyAlgorithm.RS256,

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.RS384]: SharedKeyAlgorithm.RS384,

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.RS512]: SharedKeyAlgorithm.RS512,

  /**
   * ECDSA w/ SHA-256.
   * Implementation: Recommended+ (for JWS conformance)
   */
  [SharedKeyAlgorithm.ES256]: SharedKeyAlgorithm.ES256,

  /**
   * ECDSA w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.ES384]: SharedKeyAlgorithm.ES384,

  /**
   * ECDSA w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.ES512]: SharedKeyAlgorithm.ES512,

  /**
   * RSASSA-PSS w/ SHA-256.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.PS256]: SharedKeyAlgorithm.PS256,

  /**
   * RSASSA-PSS w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.PS384]: SharedKeyAlgorithm.PS384,

  /**
   * RSASSA-PSS w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  [SharedKeyAlgorithm.PS512]: SharedKeyAlgorithm.PS512,

  /**
   * EdDSA (Edwards-curve Digital Signature Algorithm).
   * Implementation: Optional (for JWS conformance)
   * Used with Ed25519 and Ed448 curves.
   *
   * @see https://datatracker.ietf.org/doc/html/rfc8037
   */
  [SharedKeyAlgorithm.EdDSA]: SharedKeyAlgorithm.EdDSA,

  /**
   * No digital signature or MAC performed.
   * Implementation: Optional (for JWS conformance)
   *
   * NOTE: Not implemented / supported.
   */
  // NONE: 'none',
} as const satisfies Record<SharedKeyAlgorithm, unknown>;

export type JWKKeyAlgorithm = ValueOfEnum<typeof JWKKeyAlgorithm>;
