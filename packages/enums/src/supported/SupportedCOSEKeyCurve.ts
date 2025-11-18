import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { SupportedKeyCurveName } from './SupportedKeyCurveName';

export const SupportedCOSEKeyCurve = {
  [SupportedKeyCurveName.P256]: 1,
  [SupportedKeyCurveName.P384]: 2,
  [SupportedKeyCurveName.P521]: 3,
  [SupportedKeyCurveName.Ed25519]: 6,
} as const;

export type SupportedCOSEKeyCurve = ValueOfEnum<typeof SupportedCOSEKeyCurve>;

export const SupportedCOSEKeyCurveSchema = z.enum(SupportedCOSEKeyCurve).meta({
  description: 'Supported COSE Key Curve',
  examples: [SupportedCOSEKeyCurve[SupportedKeyCurveName.P256]],
});
