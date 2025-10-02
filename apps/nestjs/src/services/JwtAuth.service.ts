import { Injectable, UseFilters } from '@nestjs/common';
import { PrismaClientExceptionFilter } from '../filters/PrismaClientException.filter';
import { User } from '@repo/prisma';
import { JwtPayload } from '../types';

@Injectable()
export class JwtAuthService {
  constructor() {}

  @UseFilters(PrismaClientExceptionFilter)
  async validateJwtUser(
    user: Pick<User, 'id' | 'name' | 'email'>,
  ): Promise<JwtPayload> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    return payload;
  }
}
