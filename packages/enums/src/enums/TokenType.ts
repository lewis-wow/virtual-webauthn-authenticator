import type { ValueOfEnum } from '../types.js';

export const TokenType = {
  PERSONAL_TOKEN: 'PERSONAL_TOKEN',
  API_TOKEN: 'API_TOKEN',
} as const;

export type TokenType = ValueOfEnum<typeof TokenType>;
