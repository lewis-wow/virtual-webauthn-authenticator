import z from 'zod';

import type { ValueOfEnum } from '../types';

export const TokenBindingStatus = {
  PRESENT: 'present',
  SUPPORTED: 'supported',
} as const;

export type TokenBindingStatus = ValueOfEnum<typeof TokenBindingStatus>;

export const TokenBindingStatusSchema = z.enum(TokenBindingStatus).meta({
  description: 'Token binding status',
  examples: [TokenBindingStatus.PRESENT, TokenBindingStatus.SUPPORTED],
});
