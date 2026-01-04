import type { ValueOfEnum } from '@repo/types';

import { SharedKeyCurveName } from '../../shared/enums/SharedKeyCurveName';

export const JWKKeyCurveName = {
  [SharedKeyCurveName.P256]: SharedKeyCurveName.P256,
  [SharedKeyCurveName.P384]: SharedKeyCurveName.P384,
  [SharedKeyCurveName.P521]: SharedKeyCurveName.P521,

  /**
   * NOTE: Not implemented / supported.
   */
  // [SharedKeyCurveName.Ed25519]: 'Ed25519',
} as const satisfies Record<SharedKeyCurveName, unknown>;

export type JWKKeyCurveName = ValueOfEnum<typeof JWKKeyCurveName>;
