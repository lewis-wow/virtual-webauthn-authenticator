import type { ValueOfEnum } from '@repo/types';

export const TokenType = {
  USER: 'USER',
  API_KEY: 'API_KEY',
} as const;

export type TokenType = ValueOfEnum<typeof TokenType>;
