import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { SupportedKeyAlgorithm } from './SupportedKeyAlgorithm';

export const SupportedKeyCurveAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [SupportedKeyAlgorithm.ES256]: SupportedKeyAlgorithm.ES256,
  /** ECDSA w/ SHA-384 */
  [SupportedKeyAlgorithm.ES384]: SupportedKeyAlgorithm.ES384,
  /** ECDSA w/ SHA-512 */
  [SupportedKeyAlgorithm.ES512]: SupportedKeyAlgorithm.ES512,
} as const;

export type KeyCurveAlgorithm = ValueOfEnum<typeof SupportedKeyCurveAlgorithm>;

export const SupportedKeyCurveAlgorithmSchema = z
  .enum(SupportedKeyCurveAlgorithm)
  .meta({
    description: 'Supported Key Curve Algorithm',
    examples: [SupportedKeyCurveAlgorithm.ES256],
  });
