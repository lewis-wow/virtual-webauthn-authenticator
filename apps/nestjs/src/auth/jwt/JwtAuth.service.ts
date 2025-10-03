import { Injectable } from '@nestjs/common';
import { User } from '@repo/prisma';
import { JwtPayload } from '@/lib/types';
import { JwtService } from '@nestjs/jwt';
import { TokenType } from '@repo/enums';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async createPersonalAccessToken(
    user: Pick<User, 'id'>,
  ): Promise<{ accessToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      tokenType: TokenType.PERSONAL_TOKEN,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async createApiAccessToken(
    user: Pick<User, 'id'>,
  ): Promise<{ accessToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      tokenType: TokenType.API_TOKEN,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
