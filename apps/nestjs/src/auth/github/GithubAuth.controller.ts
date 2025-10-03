import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { JwtAuthService } from '../jwt/JwtAuth.service';
import { UserPublicFields } from '@/lib/fields/USER_PUBLIC_FIELDS';

@Controller('auth/github')
export class GithubAuthController {
  constructor(private jwtAuthService: JwtAuthService) {}

  @Get('/')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as UserPublicFields;
    const { accessToken } = await this.jwtAuthService.validateJwtUser(user);
    res.cookie('jwt', accessToken);
    res.redirect('/');
  }
}
