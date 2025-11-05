import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { CredentialsController } from './controllers/Credentials.controller';
import { HealthcheckController } from './controllers/Healthcheck.controller';
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
import { WebAuthnCredentialRepositoryProvider } from './services/WebAuthnCredentialRepository.provider';

@Module({
  imports: [],
  controllers: [
    HealthcheckController,
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
    WebAuthnCredentialRepositoryProvider,
    CredentialSignerFactoryProvider,
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
    WebAuthnCredentialRepositoryProvider,
    CredentialSignerFactoryProvider,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/api');
    consumer.apply(RequestIdMiddleware).forRoutes('/');
  }
}
