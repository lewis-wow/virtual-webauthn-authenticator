import { Schema } from 'effect';

import { TokenType } from '../../enums/TokenType';

export const TokenTypeSchema = Schema.Enums(TokenType).annotations({
  description: 'Token type',
  examples: [TokenType.PERSONAL],
});
