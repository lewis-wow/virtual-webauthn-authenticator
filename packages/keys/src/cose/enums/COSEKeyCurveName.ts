import type { ValueOfEnum } from '@repo/types';

import { JWKKeyCurveName } from '../../jwk/enums/JWKKeyCurveName';

export const COSEKeyCurveName = {
  [JWKKeyCurveName.P256]: 1,
  [JWKKeyCurveName.P384]: 2,
  [JWKKeyCurveName.P521]: 3,
  [JWKKeyCurveName.Ed25519]: 6,
} as const;

export type COSEKeyCurveName = ValueOfEnum<typeof COSEKeyCurveName>;
