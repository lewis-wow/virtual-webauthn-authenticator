import z from 'zod';

import type { ValueOfEnum } from '../types.js';

export const KeyType = {
  EC: 'EC',
  EC_HSM: 'EC-HSM',
  RSA: 'RSA',
  RSA_HSM: 'RSA-HSM',
} as const;

export type KeyType = ValueOfEnum<typeof KeyType>;

export const KeyTypeSchema = z.enum(KeyType).meta({
  description: 'Key type',
  examples: [KeyType.EC],
});
