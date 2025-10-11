import type { ValueOfEnum } from '../types.js';
import { KeyType } from './KeyType.js';

export const CoseKeyType = {
  [KeyType.OKP]: 1,
  [KeyType.EC]: 2,
  [KeyType.RSA]: 3,
} as const;

export type CoseKeyType = ValueOfEnum<typeof CoseKeyType>;
