import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Pick } from '@/lib/decorators/pick.decorator';
import { USER_PUBLIC_FIELDS } from '@/lib/fields/USER_PUBLIC_FIELDS';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/auth/jwt/JwtAuth.guard';
import { UsersService } from './Users.service';
import { JwtPayload } from '@/lib/types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Pick(USER_PUBLIC_FIELDS)
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = await this.usersService.findById((req.user as JwtPayload).sub);

    return user;
  }
}
