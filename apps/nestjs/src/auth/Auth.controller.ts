import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './Auth.service';
import { CreateApiTokenDto } from './dto/CreateTemporaryApiToken.dto';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt/JwtAuth.guard';
import type { Request } from 'express';
import { JwtPayload } from '@/lib/types';
import { RequiredTokenType } from './jwt/RequiredTokenType.decorator';
import { TokenType } from '@repo/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('token')
  @ApiBody({ type: CreateApiTokenDto })
  @RequiredTokenType(TokenType.PERSONAL_TOKEN)
  @UseGuards(JwtAuthGuard)
  async createTemporaryApiToken(
    @Req() req: Request,
    @Body() createApiTokenDto: CreateApiTokenDto,
  ) {
    const user = req.user as JwtPayload;

    const { accessToken } = await this.authService.createApiAccessToken(
      { id: user.sub },
      createApiTokenDto,
    );

    return { accessToken };
  }
}
