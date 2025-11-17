import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { KeyCurveName } from './KeyCurveName';

export const COSEKeyCurve = {
  [KeyCurveName.P256]: 1,
  [KeyCurveName.P384]: 2,
  [KeyCurveName.P521]: 3,
  [KeyCurveName.Ed25519]: 6,
} as const;

export type COSEKeyCurve = ValueOfEnum<typeof COSEKeyCurve>;

export const COSEEcCurveSchema = z.enum(COSEKeyCurve).meta({
  description: 'COSE key curve',
  examples: [COSEKeyCurve[KeyCurveName.P256]],
});
