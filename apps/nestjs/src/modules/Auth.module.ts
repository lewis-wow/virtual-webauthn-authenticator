import { Module } from '@nestjs/common';
import { AuthService } from '../services/Auth.service';
import { AuthController } from '../controllers/Auth.controller';
import { GithubStrategy } from '../strategies/Github.strategy';
import { UsersModule } from './Users.module';
import { EnvProvider } from '../services/Env.provider';
import { UsersService } from '../services/Users.service';
import { PrismaService } from '../services/Prisma.service';
import { JwtStrategy } from '../strategies/Jwt.strategy';
import { GithubAuthModule } from './GithubAuth.module';
import { JwtAuthModule } from './JwtAuth.module';

@Module({
  imports: [UsersModule, GithubAuthModule, JwtAuthModule],
  providers: [
    PrismaService,
    AuthService,
    GithubStrategy,
    JwtStrategy,
    EnvProvider,
    UsersService,
    EnvProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
