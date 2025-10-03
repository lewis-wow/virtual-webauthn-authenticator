import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Pick } from '@/lib/decorators/pick.decorator';
import { USER_PUBLIC_FIELDS } from '@/lib/fields/USER_PUBLIC_FIELDS';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/auth/jwt/JwtAuth.guard';

@Controller('users')
export class UsersController {
  @Get('profile')
  @Pick(USER_PUBLIC_FIELDS)
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    console.log(req);
    return req.user;
  }
}
