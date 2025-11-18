import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

export const KeyType = {
  EC: 'EC',
  RSA: 'RSA',
} as const;

export type KeyType = ValueOfEnum<typeof KeyType>;

export const KeyTypeSchema = z.enum(KeyType).meta({
  description: 'Key type',
  examples: [KeyType.EC],
});
