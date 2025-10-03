import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './Auth.service';
import { AuthController } from './Auth.controller';
import { UsersModule } from '../users/Users.module';
import { PrismaService } from '../services/Prisma.service';
import { GithubAuthModule } from './github/GithubAuth.module';
import { JwtAuthModule } from './jwt/JwtAuth.module';
import { EnvModule } from '@/env/Env.module';

@Module({
  imports: [GithubAuthModule, EnvModule, UsersModule, JwtAuthModule],
  providers: [PrismaService, AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
