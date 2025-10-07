import type { ValueOf } from '@repo/types';

export const KeyType = {
  OKP: 'OKP',
  EC: 'EC',
  RSA: 'RSA',
} as const;

export type KeyType = ValueOf<typeof KeyType>;
