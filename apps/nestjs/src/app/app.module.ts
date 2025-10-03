import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@/auth/Auth.module';
import { UsersModule } from '@/users/Users.module';
import { CredentialsModule } from '@/credentials/Credentials.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      // env variables are loaded using dotenvx
      ignoreEnvFile: true,
    }),
    AuthModule,
    UsersModule,
    CredentialsModule,
  ],
})
export class AppModule {}
