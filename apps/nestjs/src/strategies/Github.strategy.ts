
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { AuthService } from '../services/Auth.service';
import { EnvService } from '../services/Env.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly authService: AuthService,
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
    const { id, displayName, emails, photos } = profile;
    const user = await this.authService.validateUser({
      githubId: id,
      name: displayName,
      email: emails?.[0].value,
      image: photos?.[0].value,
    });
    done(null, user);
  }
}
