import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../env';
import { JwtStrategy } from '../strategies/Jwt.strategy';
import { JwtAuthService } from '../services/JwtAuth.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: {
        expiresIn: '1h',
      },
    }),
  ],
  providers: [JwtStrategy, JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
