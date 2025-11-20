import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';

import { CredentialsController } from './controllers/Credentials.controller';
import { HealthcheckController } from './controllers/Healthcheck.controller';
import { ProfileController } from './controllers/Profile.controller';
import { WebAuthnCredentialsController } from './controllers/WebAuthnCredentials.controller';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { RequestIdMiddleware } from './middlewares/requestId.middleware';
import { AzureCredentialProvider } from './services/AzureCredential.provider';
import { CredentialSignerFactoryProvider } from './services/CredentialSignerFactoryProvider';
import { CryptographyClientFactoryProvider } from './services/CryptographyClientFactory.provider';
import { EnvProvider } from './services/Env.provider';
import { JwtAudienceProvider } from './services/JwtAudience.provider';
import { KeyClientProvider } from './services/KeyClient.provider';
import { KeyVaultProvider } from './services/KeyVault.provider';
import { LoggerProvider } from './services/Logger.provider';
import { PrismaService } from './services/Prisma.service';
import { VirtualAuthenticatorProvider } from './services/VirtualAuthenticator.provider';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
    }),
  ],
  controllers: [
    HealthcheckController,
    ProfileController,
    CredentialsController,
    WebAuthnCredentialsController,
  ],
  providers: [
    PrismaService,
    AzureCredentialProvider,
    CryptographyClientFactoryProvider,
    EnvProvider,
    JwtAudienceProvider,
    KeyClientProvider,
    KeyVaultProvider,
    LoggerProvider,
    VirtualAuthenticatorProvider,
    CredentialSignerFactoryProvider,
    JwtMiddleware,
  ],
  exports: [
    PrismaService,
    AzureCredentialProvider,
    CryptographyClientFactoryProvider,
    EnvProvider,
    JwtAudienceProvider,
    KeyClientProvider,
    KeyVaultProvider,
    LoggerProvider,
    VirtualAuthenticatorProvider,
    CredentialSignerFactoryProvider,
    JwtMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/api');
    consumer.apply(RequestIdMiddleware).forRoutes('/');
  }
}
