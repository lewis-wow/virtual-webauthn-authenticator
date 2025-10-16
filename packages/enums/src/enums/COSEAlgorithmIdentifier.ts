import z from 'zod';

import type { ValueOfEnum } from '../types.js';

/**
 * Enum for cryptographic algorithms defined in the IANA COSE registry.
 * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
 * @see https://w3c.github.io/webauthn/#sctn-alg-identifier
 */
export const COSEAlgorithmIdentifier = {
  /** ECDSA w/ SHA-256 */
  ES256: -7,
  /** ECDSA w/ SHA-384 */
  ES384: -35,
  /** ECDSA w/ SHA-512 */
  ES512: -36,

  /** RSASSA-PSS w/ SHA-256 */
  PS256: -37,
  /** RSASSA-PSS w/ SHA-384 */
  PS384: -38,
  /** RSASSA-PSS w/ SHA-512 */
  PS512: -39,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  RS256: -257,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  RS384: -258,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  RS512: -259,
  /** RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  RS1: -65535,

  /** Edwards-curve Digital Signature Algorithm */
  EdDSA: -8,
} as const;

export type COSEAlgorithmIdentifier = ValueOfEnum<
  typeof COSEAlgorithmIdentifier
>;

export const COSEAlgorithmIdentifierSchema = z
  .enum(COSEAlgorithmIdentifier)
  .meta({
    description: 'COSE algorithm identifier',
  });
