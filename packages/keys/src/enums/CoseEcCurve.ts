import type { ValueOf } from '@repo/types';

export const CoseEcCurve = {
  'P-256': 1,
  'P-384': 2,
  'P-521': 3,
  Ed25519: 6,
} as const;

export type CoseEcCurve = ValueOf<typeof CoseEcCurve>;
