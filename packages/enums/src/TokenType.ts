import { ValueOf } from '@repo/types';

export const TokenType = {
  PERSONAL_TOKEN: 'PERSONAL_TOKEN',
  API_TOKEN: 'API_TOKEN',
} as const;

export type TokenType = ValueOf<typeof TokenType>;
