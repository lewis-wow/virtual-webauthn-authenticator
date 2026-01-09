import type { ValueOfEnum } from '@repo/types';

import type { JWKKeyCurveName } from './JWKKeyCurveName';

export const COSEKeyCurveName = {
  /**
   * NIST P-256 curve (secp256r1).
   * Used with ECDSA algorithms (ES256).
   */
  ['P-256']: 1,

  /**
   * NIST P-384 curve (secp384r1).
   * Used with ECDSA algorithms (ES384).
   */
  ['P-384']: 2,

  /**
   * NIST P-521 curve (secp521r1).
   * Used with ECDSA algorithms (ES512).
   */
  ['P-521']: 3,

  /**
   * Ed25519 curve for EdDSA.
   * Used with EdDSA signature algorithm.
   */
  Ed25519: 6,
} as const satisfies Record<JWKKeyCurveName, number>;

export type COSEKeyCurveName = ValueOfEnum<typeof COSEKeyCurveName>;
