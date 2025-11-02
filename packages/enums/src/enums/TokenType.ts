import z from 'zod';

import type { ValueOfEnum } from '../types';

export const TokenType = {
  PERSONAL: 'PERSONAL',
  API_KEY: 'API_KEY',
} as const;

export type TokenType = ValueOfEnum<typeof TokenType>;

export const TokenTypeSchema = z.enum(TokenType).meta({
  description: 'Token type',
  examples: [TokenType.PERSONAL],
});
