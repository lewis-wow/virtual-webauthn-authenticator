import type { ValueOf } from '@repo/types';

// COSE EC Key Parameters
export const CoseEcParam = {
  crv: -1,
  x: -2,
  y: -3,
  d: -4,
} as const;

export type CoseEcParam = ValueOf<typeof CoseEcParam>;
