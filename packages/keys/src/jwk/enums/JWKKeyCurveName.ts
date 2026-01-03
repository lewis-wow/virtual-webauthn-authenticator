import type { ValueOfEnum } from '@repo/types';

import { SharedKeyCurveName } from '../../shared/enums/SharedKeyCurveName';

export const JWKKeyCurveName = {
  [SharedKeyCurveName.P256]: 'P-256',
  [SharedKeyCurveName.P384]: 'P-384',
  [SharedKeyCurveName.P521]: 'P-521',
  [SharedKeyCurveName.Ed25519]: 'Ed25519',
} as const;

export type JWKKeyCurveName = ValueOfEnum<typeof JWKKeyCurveName>;

// Reverse mapping for lookups: from JWK string value to SharedKeyCurveName
export const JWKKeyCurveNameToShared: Record<string, string> = {
  'P-256': SharedKeyCurveName.P256,
  'P-384': SharedKeyCurveName.P384,
  'P-521': SharedKeyCurveName.P521,
  Ed25519: SharedKeyCurveName.Ed25519,
};
