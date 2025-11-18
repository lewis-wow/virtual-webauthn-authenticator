import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { SupportedKeyAlgorithm } from './SupportedKeyAlgorithm';

export const SupportedKeyRsaAlgorithm = {
  /** RSASSA-PSS w/ SHA-256 */
  [SupportedKeyAlgorithm.PS256]: SupportedKeyAlgorithm.PS256,
  /** RSASSA-PSS w/ SHA-384 */
  [SupportedKeyAlgorithm.PS384]: SupportedKeyAlgorithm.PS384,
  /** RSASSA-PSS w/ SHA-512 */
  [SupportedKeyAlgorithm.PS512]: SupportedKeyAlgorithm.PS512,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  [SupportedKeyAlgorithm.RS256]: SupportedKeyAlgorithm.RS256,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  [SupportedKeyAlgorithm.RS384]: SupportedKeyAlgorithm.RS384,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  [SupportedKeyAlgorithm.RS512]: SupportedKeyAlgorithm.RS512,

  /**
   * RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  [SupportedKeyAlgorithm.RS1]: SupportedKeyAlgorithm.RS1,
} as const;

export type SupportedKeyRsaAlgorithm = ValueOfEnum<
  typeof SupportedKeyRsaAlgorithm
>;

export const SupportedKeyRsaAlgorithmSchema = z
  .enum(SupportedKeyRsaAlgorithm)
  .meta({
    description: 'Supported Key RSA Algorithm',
    examples: [SupportedKeyRsaAlgorithm.PS256],
  });
