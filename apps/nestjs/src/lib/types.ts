import { TokenType } from '@repo/enums';

export type JwtPayload = {
  sub: string;
  tokenType: TokenType;
};
