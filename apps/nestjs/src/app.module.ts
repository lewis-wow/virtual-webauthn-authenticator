import { Module } from '@nestjs/common';
import { KeyClientProvider } from './services/KeyClient.provider.js';
import { ConfigModule } from '@nestjs/config';
import { CredentialsService } from './services/Credentials.service.js';
import { CredentialsController } from './controllers/Credentials.controller.js';
import { KeyClientService } from './services/KeyClient.service.js';
import { EnvProvider } from './services/Env.provider.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      // env variables are loaded using dotenvx
      ignoreEnvFile: true,
    }),
  ],
  controllers: [CredentialsController],
  providers: [
    EnvProvider,
    CredentialsService,
    KeyClientProvider,
    KeyClientService,
    CredentialsService,
  ],
})
export class AppModule {}
