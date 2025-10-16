import z from 'zod';

import type { ValueOfEnum } from '../types.js';
import { KeyType } from './KeyType.js';

export const COSEKeyType = {
  [KeyType.OKP]: 1,
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;

export const COSEKeyTypeSchema = z.enum(COSEKeyType).meta({
  description: 'COSE key type',
});
