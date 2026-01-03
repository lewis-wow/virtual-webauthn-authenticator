import type { ValueOfEnum } from '@repo/types';

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
  HS256: 'HS256',

  /**
   * HMAC using SHA-384.
   * Implementation: Optional (for JWS conformance)
   * Note: This is a symmetric algorithm, not used for public key (asymmetric) signing.
   */
  HS384: 'HS384',

  /**
   * HMAC using SHA-512.
   * Implementation: Optional (for JWS conformance)
   * Note: This is a symmetric algorithm, not used for public key (asymmetric) signing.
   */
  HS512: 'HS512',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-256.
   * Implementation: Recommended (for JWS conformance)
   */
  RS256: 'RS256',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  RS384: 'RS384',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  RS512: 'RS512',

  /**
   * ECDSA w/ SHA-256.
   * Implementation: Recommended+ (for JWS conformance)
   */
  ES256: 'ES256',

  /**
   * ECDSA w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  ES384: 'ES384',

  /**
   * ECDSA w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  ES512: 'ES512',

  /**
   * RSASSA-PSS w/ SHA-256.
   * Implementation: Optional (for JWS conformance)
   */
  PS256: 'PS256',

  /**
   * RSASSA-PSS w/ SHA-384.
   * Implementation: Optional (for JWS conformance)
   */
  PS384: 'PS384',

  /**
   * RSASSA-PSS w/ SHA-512.
   * Implementation: Optional (for JWS conformance)
   */
  PS512: 'PS512',

  /**
   * No digital signature or MAC performed.
   * Implementation: Optional (for JWS conformance)
   */
  NONE: 'none',
} as const;

export type JWKKeyAlgorithm = ValueOfEnum<typeof JWKKeyAlgorithm>;
