import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../services/Auth.service';
import { type Env, EnvProviderToken } from '../services/Env.provider';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
    @Inject(EnvProviderToken) readonly envProvider: Env,
  ) {
    super({
      clientID: envProvider.GITHUB_CLIENT_ID,
      clientSecret: envProvider.GITHUB_CLIENT_SECRET,
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
    const user = await this.authService.validateGithubUser(profile);

    done(null, user);
  }
}
