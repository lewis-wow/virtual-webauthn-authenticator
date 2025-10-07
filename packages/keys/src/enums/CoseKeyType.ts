import type { ValueOf } from '@repo/types';
import { KeyType } from './KeyType.js';

export const CoseKeyType = {
  [KeyType.OKP]: 1,
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type CoseKeyType = ValueOf<typeof CoseKeyType>;
