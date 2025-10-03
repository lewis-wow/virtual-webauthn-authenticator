import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaClientExceptionFilter } from '@/lib/filters/PrismaClientException.filter';
import { User } from '@repo/prisma';
import { JwtPayload } from '@/lib/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  @UseFilters(PrismaClientExceptionFilter)
  async validateJwtUser(
    user: Pick<User, 'id' | 'name' | 'email'>,
  ): Promise<{ accessToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }
}
