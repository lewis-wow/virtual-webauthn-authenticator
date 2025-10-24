import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { KeyAlgorithm } from './KeyAlgorithm.js';

export const COSEKeyAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [KeyAlgorithm.ES256]: -7,
  /** ECDSA w/ SHA-384 */
  [KeyAlgorithm.ES384]: -35,
  /** ECDSA w/ SHA-512 */
  [KeyAlgorithm.ES512]: -36,

  // /** Edwards-curve Digital Signature Algorithm */
  // [KeyAlgorithm.EdDSA]: -8,

  /** RSASSA-PSS w/ SHA-256 */
  [KeyAlgorithm.PS256]: -37,
  /** RSASSA-PSS w/ SHA-384 */
  [KeyAlgorithm.PS384]: -38,
  /** RSASSA-PSS w/ SHA-512 */
  [KeyAlgorithm.PS512]: -39,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  [KeyAlgorithm.RS256]: -257,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  [KeyAlgorithm.RS384]: -258,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  [KeyAlgorithm.RS512]: -259,

  /** RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  [KeyAlgorithm.RS1]: -65535,
} as const;

export type COSEKeyAlgorithm = ValueOfEnum<typeof COSEKeyAlgorithm>;

export const COSEKeyAlgorithmSchema = z.enum(COSEKeyAlgorithm).meta({
  description: 'COSE key algorithm',
  examples: [COSEKeyAlgorithm[KeyAlgorithm.ES256]],
});
