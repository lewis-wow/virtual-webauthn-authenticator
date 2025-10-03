import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './Jwt.strategy';
import { JwtAuthService } from './JwtAuth.service';
import { EnvService } from '@/env/Env.service';
import { EnvModule } from '@/env/Env.module';

@Module({
  imports: [
    PassportModule,
    EnvModule,
    JwtModule.registerAsync({
      imports: [EnvModule],
      useFactory: async (envService: EnvService) => ({
        secret: envService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [EnvService],
    }),
  ],
  providers: [JwtStrategy, JwtAuthService],
  exports: [JwtAuthService, JwtModule],
})
export class JwtAuthModule {}
