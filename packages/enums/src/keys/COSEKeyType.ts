import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { KeyType } from '../keys/KeyType';

export const COSEKeyType = {
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;

export const COSEKeyTypeSchema = z.enum(COSEKeyType).meta({
  description: 'COSE Key Type',
  examples: [COSEKeyType[KeyType.EC]],
});
