import type { ValueOfEnum } from '@repo/types';

import { SharedKeyCurveName } from '../../shared/enums/SharedKeyCurveName';

export const COSEKeyCurveName = {
  /**
   * NIST P-256 curve (secp256r1).
   * Used with ECDSA algorithms (ES256).
   */
  [SharedKeyCurveName['P-256']]: 1,

  /**
   * NIST P-384 curve (secp384r1).
   * Used with ECDSA algorithms (ES384).
   */
  [SharedKeyCurveName['P-384']]: 2,

  /**
   * NIST P-521 curve (secp521r1).
   * Used with ECDSA algorithms (ES512).
   */
  [SharedKeyCurveName['P-521']]: 3,

  /**
   * Ed25519 curve for EdDSA.
   * Used with EdDSA signature algorithm.
   */
  [SharedKeyCurveName.Ed25519]: 6,
} as const satisfies Record<SharedKeyCurveName, unknown>;

export type COSEKeyCurveName = ValueOfEnum<typeof COSEKeyCurveName>;
