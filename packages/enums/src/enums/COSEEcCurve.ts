import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { EcCurve } from './EcCurve.js';

export const COSEEcCurve = {
  [EcCurve['P-256']]: 1,
  [EcCurve['P-384']]: 2,
  [EcCurve['P-521']]: 3,
  [EcCurve.Ed25519]: 6,
} as const;

export type COSEEcCurve = ValueOfEnum<typeof COSEEcCurve>;

export const COSEEcCurveSchema = z.enum(COSEEcCurve).meta({
  description: 'COSE EC curve',
  examples: [COSEEcCurve[EcCurve['P-256']]],
});
