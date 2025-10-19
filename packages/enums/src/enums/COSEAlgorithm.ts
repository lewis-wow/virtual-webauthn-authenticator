import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { AsymetricSigningAlgorithm } from './AsymetricSigningAlgorithm.js';

export const COSEAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [AsymetricSigningAlgorithm.ES256]: -7,
  /** ECDSA w/ SHA-384 */
  [AsymetricSigningAlgorithm.ES384]: -35,
  /** ECDSA w/ SHA-512 */
  [AsymetricSigningAlgorithm.ES512]: -36,

  /** Edwards-curve Digital Signature Algorithm */
  [AsymetricSigningAlgorithm.EdDSA]: -8,

  /** RSASSA-PSS w/ SHA-256 */
  [AsymetricSigningAlgorithm.PS256]: -37,
  /** RSASSA-PSS w/ SHA-384 */
  [AsymetricSigningAlgorithm.PS384]: -38,
  /** RSASSA-PSS w/ SHA-512 */
  [AsymetricSigningAlgorithm.PS512]: -39,

  /** RSASSA-PKCS1-v1_5 w/ SHA-256 */
  [AsymetricSigningAlgorithm.RS256]: -257,
  /** RSASSA-PKCS1-v1_5 w/ SHA-384 */
  [AsymetricSigningAlgorithm.RS384]: -258,
  /** RSASSA-PKCS1-v1_5 w/ SHA-512 */
  [AsymetricSigningAlgorithm.RS512]: -259,

  /** RSASSA-PKCS1-v1_5 w/ SHA-1
   * @deprecated
   */
  [AsymetricSigningAlgorithm.RS1]: -65535,
} as const;

export type COSEAlgorithm = ValueOfEnum<typeof COSEAlgorithm>;

export const COSEAlgorithmSchema = z.enum(COSEAlgorithm).meta({
  description: 'COSE Algorithm',
  examples: [COSEAlgorithm[AsymetricSigningAlgorithm.ES256]],
});
