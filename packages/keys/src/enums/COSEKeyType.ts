import type { ValueOfEnum } from '@repo/types';

import { KeyType } from './KeyType';

export const COSEKeyType = {
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type COSEKeyType = ValueOfEnum<typeof COSEKeyType>;
