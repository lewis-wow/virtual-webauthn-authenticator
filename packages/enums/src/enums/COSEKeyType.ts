import z from 'zod';

import type { ValueOfEnum } from '../types';
import { KeyType } from './KeyType';

export const COSEKeyType = {
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;

export const COSEKeyTypeSchema = z.enum(COSEKeyType).meta({
  description: 'COSE key type',
  examples: [COSEKeyType[KeyType.EC]],
});
