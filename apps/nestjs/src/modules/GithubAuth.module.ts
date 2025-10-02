import { Module } from '@nestjs/common';
import { AuthService } from '../services/Auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { GithubStrategy } from '../strategies/Github.strategy';
import { UsersModule } from './Users.module';
import { EnvProvider } from '../services/Env.provider';
import { UsersService } from '../services/Users.service';
import { env } from '../env';
import { PrismaService } from '../services/Prisma.service';
import { JwtStrategy } from '../strategies/Jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [
    PrismaService,
    AuthService,
    GithubStrategy,
    JwtStrategy,
    EnvProvider,
    UsersService,
    EnvProvider,
  ],
  controllers: [GithubAuthModule],
})
export class GithubAuthModule {}
