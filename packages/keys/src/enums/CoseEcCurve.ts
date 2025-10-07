import type { ValueOf } from '@repo/types';
import { EcCurve } from './EcCurve.js';

export const CoseEcCurve = {
  [EcCurve['P-256']]: 1,
  [EcCurve['P-384']]: 2,
  [EcCurve['P-521']]: 3,
  [EcCurve.Ed25519]: 6,
} as const;

export type CoseEcCurve = ValueOf<typeof CoseEcCurve>;
