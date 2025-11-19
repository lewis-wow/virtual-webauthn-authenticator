import type { ValueOfEnum } from '@repo/types';

import { KeyAlgorithm } from './KeyAlgorithm';

export const KeyCurveAlgorithm = {
  /** ECDSA w/ SHA-256 */
  [KeyAlgorithm.ES256]: KeyAlgorithm.ES256,
  /** ECDSA w/ SHA-384 */
  [KeyAlgorithm.ES384]: KeyAlgorithm.ES384,
  /** ECDSA w/ SHA-512 */
  [KeyAlgorithm.ES512]: KeyAlgorithm.ES512,
} as const;

export type KeyCurveAlgorithm = ValueOfEnum<typeof KeyCurveAlgorithm>;
