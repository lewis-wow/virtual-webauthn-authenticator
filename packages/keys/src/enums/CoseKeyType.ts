import type { ValueOf } from '@repo/types';

export const CoseKeyType = {
  EC: 2,
  RSA: 3,
  oct: 4,
} as const;

export type CoseKeyType = ValueOf<typeof CoseKeyType>;
