import { SetMetadata } from '@nestjs/common';
import { TokenType } from '@repo/enums';

export const TOKEN_TYPE_KEY = 'tokenType';
export const RequiredTokenType = (tokenType: TokenType) => SetMetadata(TOKEN_TYPE_KEY, tokenType);
