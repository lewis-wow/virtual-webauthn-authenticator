import type { ValueOfEnum } from '@repo/types';

export const KeyType = {
  EC: 'EC',
  RSA: 'RSA',
} as const;

export type KeyType = ValueOfEnum<typeof KeyType>;
