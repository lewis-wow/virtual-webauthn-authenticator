import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { SupportedKeyAlgorithm } from './SupportedKeyAlgorithm';

export const SupportedCOSEKeyAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [SupportedKeyAlgorithm.ES256]: -7,
  /** ECDSA w/ SHA-384 */
  [SupportedKeyAlgorithm.ES384]: -35,
  /** ECDSA w/ SHA-512 */
  [SupportedKeyAlgorithm.ES512]: -36,

  // /** Edwards-curve Digital Signature Algorithm */
  // [KeyAlgorithm.EdDSA]: -8,

  /** RSASSA-PSS w/ SHA-256 */
  [SupportedKeyAlgorithm.PS256]: -37,
  /** RSASSA-PSS w/ SHA-384 */
  [SupportedKeyAlgorithm.PS384]: -38,
  /** RSASSA-PSS w/ SHA-512 */
  [SupportedKeyAlgorithm.PS512]: -39,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  [SupportedKeyAlgorithm.RS256]: -257,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  [SupportedKeyAlgorithm.RS384]: -258,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  [SupportedKeyAlgorithm.RS512]: -259,

  /** RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  [SupportedKeyAlgorithm.RS1]: -65535,
} as const;

export type SupportedCOSEKeyAlgorithm = ValueOfEnum<
  typeof SupportedCOSEKeyAlgorithm
>;

export const SupportedCOSEKeyAlgorithmSchema = z
  .enum(SupportedCOSEKeyAlgorithm)
  .meta({
    description: 'Supported COSE Key Algorithm',
    examples: [SupportedCOSEKeyAlgorithm[SupportedKeyAlgorithm.ES256]],
  });
