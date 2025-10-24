import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { KeyAlgorithm } from './KeyAlgorithm.js';

export const KeyRsaAlgorithm = {
  /** RSASSA-PSS w/ SHA-256 */
  [KeyAlgorithm.PS256]: KeyAlgorithm.PS256,
  /** RSASSA-PSS w/ SHA-384 */
  [KeyAlgorithm.PS384]: KeyAlgorithm.PS384,
  /** RSASSA-PSS w/ SHA-512 */
  [KeyAlgorithm.PS512]: KeyAlgorithm.PS512,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  [KeyAlgorithm.RS256]: KeyAlgorithm.RS256,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  [KeyAlgorithm.RS384]: KeyAlgorithm.RS384,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  [KeyAlgorithm.RS512]: KeyAlgorithm.RS512,

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  [KeyAlgorithm.RS1]: KeyAlgorithm.RS1,
} as const;

export type KeyRsaAlgorithm = ValueOfEnum<typeof KeyRsaAlgorithm>;

export const KeyRsaAlgorithmSchema = z.enum(KeyRsaAlgorithm).meta({
  description: 'Key RSA algorithm',
  examples: [KeyRsaAlgorithm.PS256],
});
