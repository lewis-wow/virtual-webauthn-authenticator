import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const KeyAlgorithm = {
  /** ECDSA w/ SHA-256 */
  ES256: 'ES256',
  /** ECDSA w/ SHA-384 */
  ES384: 'ES384',
  /** ECDSA w/ SHA-512 */
  ES512: 'ES512',

  /** Edwards-curve Digital Signature Algorithm */
  EdDSA: 'EdDSA',

  /** RSASSA-PSS w/ SHA-256 */
  PS256: 'PS256',
  /** RSASSA-PSS w/ SHA-384 */
  PS384: 'PS384',
  /** RSASSA-PSS w/ SHA-512 */
  PS512: 'PS512',

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  RS256: 'RS256',
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  RS384: 'RS384',
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  RS512: 'RS512',

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  RS1: 'RS1',
} as const;

export type KeyAlgorithm = ValueOfEnum<typeof KeyAlgorithm>;

export const KeyAlgorithmSchema = z.enum(KeyAlgorithm).meta({
  description: 'Key algorithm',
  examples: [KeyAlgorithm.ES256],
});
