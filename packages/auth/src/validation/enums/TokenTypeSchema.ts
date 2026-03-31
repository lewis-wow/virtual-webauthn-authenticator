import z from 'zod';

import { TokenType } from '../../enums/TokenType';

export const TokenTypeSchema = z.enum(TokenType).meta({
  description: 'Token type',
  examples: [TokenType.USER],
});
