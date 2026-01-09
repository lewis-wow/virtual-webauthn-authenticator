import type { ValueOfEnum } from '@repo/types';

/**
 * JWK Key Algorithms.
 *
 * Defines cryptographic algorithm identifiers that are common between
 * COSE (CBOR Object Signing and Encryption) and JWK (JSON Web Key).
 *
 * These algorithms are used for digital signatures and are supported
 * in both standards with different representations (integers in COSE,
 * strings in JWK).
 */
export const JWKKeyAlgorithm = {
  /**
   * ECDSA w/ SHA-256.
   * - COSE: -7
   * - JWK: 'ES256'
   */
  ES256: 'ES256',

  /**
   * ECDSA w/ SHA-384.
   * - COSE: -35
   * - JWK: 'ES384'
   */
  ES384: 'ES384',

  /**
   * ECDSA w/ SHA-512.
   * - COSE: -36
   * - JWK: 'ES512'
   */
  ES512: 'ES512',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-256.
   * - COSE: -257
   * - JWK: 'RS256'
   */
  RS256: 'RS256',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-384.
   * - COSE: -258
   * - JWK: 'RS384'
   */
  RS384: 'RS384',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-512.
   * - COSE: -259
   * - JWK: 'RS512'
   */
  RS512: 'RS512',

  /**
   * RSASSA-PSS w/ SHA-256.
   * - COSE: -37
   * - JWK: 'PS256'
   */
  PS256: 'PS256',

  /**
   * RSASSA-PSS w/ SHA-384.
   * - COSE: -38
   * - JWK: 'PS384'
   */
  PS384: 'PS384',

  /**
   * RSASSA-PSS w/ SHA-512.
   * - COSE: -39
   * - JWK: 'PS512'
   */
  PS512: 'PS512',

  /**
   * EdDSA (Edwards-curve Digital Signature Algorithm).
   * Used with Ed25519 and Ed448 curves.
   * - COSE: -8
   * - JWK: 'EdDSA'
   */
  EdDSA: 'EdDSA',
} as const;

export type JWKKeyAlgorithm = ValueOfEnum<typeof JWKKeyAlgorithm>;
