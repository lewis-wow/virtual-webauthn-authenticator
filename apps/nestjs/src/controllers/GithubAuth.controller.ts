import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';

@Controller('auth/github')
export class GithubAuthController {
  @Get('/')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('/callback')
  @UseGuards(AuthGuard('github'))
  githubAuthRedirect(@Req() _req: Request, @Res() res: Response) {
    res.redirect('/');
  }
}
