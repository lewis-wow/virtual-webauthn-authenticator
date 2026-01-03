import type { ValueOfEnum } from '@repo/types';

import { SharedKeyCurveName } from '../../shared/enums/SharedKeyCurveName';

export const COSEKeyCurveName = {
  [SharedKeyCurveName.P256]: 1,
  [SharedKeyCurveName.P384]: 2,
  [SharedKeyCurveName.P521]: 3,
  [SharedKeyCurveName.Ed25519]: 6,
} as const;

export type COSEKeyCurveName = ValueOfEnum<typeof COSEKeyCurveName>;
