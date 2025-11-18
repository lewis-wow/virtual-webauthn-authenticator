import type { ValueOfEnum } from '@repo/types';
import z from 'zod';

import { KeyType } from './KeyType';

export const SupportedCOSEKeyType = {
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type SupportedCOSEKeyType = ValueOfEnum<typeof SupportedCOSEKeyType>;

export const SupportedCOSEKeyTypeSchema = z.enum(SupportedCOSEKeyType).meta({
  description: 'Supported COSE Key Type',
  examples: [SupportedCOSEKeyType[KeyType.EC]],
});
