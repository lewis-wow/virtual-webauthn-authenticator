import { Module } from '@nestjs/common';
import { GithubStrategy } from './Github.strategy';
import { UsersModule } from '../../users/Users.module';
import { GithubAuthController } from './GithubAuth.controller';
import { JwtAuthModule } from '../jwt/JwtAuth.module';
import { EnvModule } from '@/env/Env.module';
import { GithubAuthService } from './GithubAuth.service';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@/services/Prisma.service';

@Module({
  imports: [EnvModule, JwtAuthModule, UsersModule],
  providers: [PassportModule, GithubStrategy, GithubAuthService, PrismaService],
  controllers: [GithubAuthController],
  exports: [GithubAuthService],
})
export class GithubAuthModule {}
