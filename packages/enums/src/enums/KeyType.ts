import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const KeyType = {
  EC: 'EC',
  RSA: 'RSA',
} as const;

export type KeyType = ValueOfEnum<typeof KeyType>;

export const KeyTypeSchema = z.enum(KeyType).meta({
  description: 'Key type',
  examples: [KeyType.EC],
});
