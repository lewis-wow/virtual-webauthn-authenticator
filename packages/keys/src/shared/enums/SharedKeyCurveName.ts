import type { ValueOfEnum } from '@repo/types';

/**
 * Shared Key Curve Names.
 *
 * Defines elliptic curve identifiers that are common between
 * COSE (CBOR Object Signing and Encryption) and JWK (JSON Web Key).
 *
 * These curve names are used for elliptic curve cryptography and are
 * supported in both standards with different representations
 * (integers in COSE, strings in JWK).
 */
export const SharedKeyCurveName = {
  /**
   * NIST P-256 curve (secp256r1).
   * - COSE: 1
   * - JWK: 'P-256'
   */
  'P-256': 'P-256',

  /**
   * NIST P-384 curve (secp384r1).
   * - COSE: 2
   * - JWK: 'P-384'
   */
  'P-384': 'P-384',

  /**
   * NIST P-521 curve (secp521r1).
   * - COSE: 3
   * - JWK: 'P-521'
   */
  'P-521': 'P-521',

  /**
   * Ed25519 curve for EdDSA.
   * - COSE: 6
   * - JWK: 'Ed25519'
   */
  Ed25519: 'Ed25519',
} as const;

export type SharedKeyCurveName = ValueOfEnum<typeof SharedKeyCurveName>;
