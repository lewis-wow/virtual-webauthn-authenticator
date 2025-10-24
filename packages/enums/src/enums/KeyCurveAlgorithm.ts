import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { KeyAlgorithm } from './KeyAlgorithm.js';

export const KeyCurveAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [KeyAlgorithm.ES256]: KeyAlgorithm.ES256,
  /** ECDSA w/ SHA-384 */
  [KeyAlgorithm.ES384]: KeyAlgorithm.ES384,
  /** ECDSA w/ SHA-512 */
  [KeyAlgorithm.ES512]: KeyAlgorithm.ES512,
} as const;

export type KeyCurveAlgorithm = ValueOfEnum<typeof KeyCurveAlgorithm>;

export const KeyCurveAlgorithmSchema = z.enum(KeyCurveAlgorithm).meta({
  description: 'Key curve algorithm',
  examples: [KeyCurveAlgorithm.ES256],
});
