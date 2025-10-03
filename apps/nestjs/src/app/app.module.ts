import { Module } from '@nestjs/common';
// import { KeyClientProvider } from '../services/KeyClient.provider.js';
import { ConfigModule } from '@nestjs/config';
// import { CredentialsService } from '../services/Credentials.service.js';
// import { CredentialsController } from '../controllers/Credentials.controller.js';
// import { KeyClientService } from '../services/KeyClient.service.js';
// import { EnvProvider } from '../services/Env.provider.js';
// import { PrismaService } from '../services/Prisma.service.js';
import { AuthModule } from '../auth/Auth.module.js';
import { UsersModule } from '../users/Users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      // env variables are loaded using dotenvx
      ignoreEnvFile: true,
    }),
    AuthModule,
    UsersModule,
  ],
  // controllers: [CredentialsController],
  // providers: [
  //   EnvProvider,
  //   CredentialsService,
  //   KeyClientProvider,
  //   KeyClientService,
  //   CredentialsService,
  //   PrismaService,
  // ],
})
export class AppModule {}
