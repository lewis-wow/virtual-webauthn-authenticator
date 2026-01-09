import type { ValueOfEnum } from '@repo/types';

import { SharedKeyCurveName } from '../../shared/enums/SharedKeyCurveName';

export const JWKKeyCurveName = {
  [SharedKeyCurveName['P-256']]: SharedKeyCurveName['P-256'],
  [SharedKeyCurveName['P-384']]: SharedKeyCurveName['P-384'],
  [SharedKeyCurveName['P-521']]: SharedKeyCurveName['P-521'],
  [SharedKeyCurveName.Ed25519]: SharedKeyCurveName.Ed25519,
} as const satisfies Record<SharedKeyCurveName, unknown>;

export type JWKKeyCurveName = ValueOfEnum<typeof JWKKeyCurveName>;
