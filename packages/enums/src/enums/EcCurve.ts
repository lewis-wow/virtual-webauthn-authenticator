import type { ValueOfEnum } from '../types.js';

export const EcCurve = {
  'P-256': 'P-256',
  'P-384': 'P-384',
  'P-521': 'P-521',
  Ed25519: 'Ed25519',
} as const;

export type EcCurve = ValueOfEnum<typeof EcCurve>;
