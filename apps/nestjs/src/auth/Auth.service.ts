import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/services/Prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ApiToken, User } from '@repo/prisma';
import { JwtAuthService } from './jwt/JwtAuth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async createApiAccessToken(
    user: Pick<User, 'id'>,
    options: Pick<ApiToken, 'expiresAt'>,
  ): Promise<{ accessToken: string }> {
    const { accessToken } =
      await this.jwtAuthService.createApiAccessToken(user);

    await this.prismaService.apiToken.create({
      data: {
        userId: user.id,
        ...options,
        accessToken,
      },
    });

    return { accessToken };
  }
}
