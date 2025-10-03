import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { EnvService } from '@/env/Env.service';
import { GithubAuthService } from './GithubAuth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly githubAuthService: GithubAuthService,
    readonly envService: EnvService,
  ) {
    super({
      clientID: envService.get('GITHUB_CLIENT_ID'),
      clientSecret: envService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const user = await this.githubAuthService.validateGithubUser(profile);

    done(null, user);
  }
}
