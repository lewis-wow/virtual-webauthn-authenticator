import type { ValueOfEnum } from '@repo/types';

export const TokenType = {
  PERSONAL: 'PERSONAL',
  API_KEY: 'API_KEY',
} as const;

export type TokenType = ValueOfEnum<typeof TokenType>;
