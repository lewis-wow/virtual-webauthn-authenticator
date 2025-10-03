import { Module, forwardRef } from '@nestjs/common';
import { GithubStrategy } from './Github.strategy';
import { UsersModule } from '../../users/Users.module';
import { GithubAuthController } from './GithubAuth.controller';
import { JwtAuthModule } from '../jwt/JwtAuth.module';
import { EnvModule } from '@/env/Env.module';
import { AuthModule } from '../Auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    EnvModule,
    JwtAuthModule,
    UsersModule,
  ],
  providers: [GithubStrategy],
  controllers: [GithubAuthController],
})
export class GithubAuthModule {}
