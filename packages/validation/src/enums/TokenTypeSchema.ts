import z from 'zod';
import { TokenType } from '@repo/enums';

/**
 * Corresponds to: `TokenType`
 */
export const TokenTypeSchema = z
  .enum(TokenType)
  .describe('The type of the token.');
