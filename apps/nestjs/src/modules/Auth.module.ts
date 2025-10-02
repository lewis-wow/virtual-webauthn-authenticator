import { Module } from '@nestjs/common';
import { AuthService } from '../services/Auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from '../controllers/Auth.controller';
import { GithubStrategy } from '../strategies/Github.strategy';
import { UsersModule } from './Users.module';
import { EnvProvider } from '../services/Env.provider';
import { UsersService } from '../services/Users.service';
import { env } from '../env';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'github' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [AuthService, GithubStrategy, EnvProvider, UsersService],
  controllers: [AuthController],
})
export class AuthModule {}
