import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { HealthcheckController } from './controllers/Healthcheck.controller';
import { JwtMiddleware } from './middlewares/jwt.middleware';
import { AzureCredentialProvider } from './services/AzureCredential.provider';
import { CryptographyClientFactoryProvider } from './services/CryptographyClientFactory.provider';
import { EnvProvider } from './services/Env.provider';
import { JwtProvider } from './services/Jwt.provider';
import { KeyClientProvider } from './services/KeyClient.provider';
import { KeyVaultProvider } from './services/KeyVault.provider';
import { LoggerProvider } from './services/Logger.provider';
import { PrismaService } from './services/Prisma.service';
import { VirtualAuthenticatorProvdier } from './services/VirtualAuthenticator.provider';
import { WebAuthnCredentialRepositoryProvider } from './services/WebAuthnCredentialRepository.provider';

@Module({
  imports: [],
  controllers: [HealthcheckController],
  providers: [
    PrismaService,
    AzureCredentialProvider,
    CryptographyClientFactoryProvider,
    EnvProvider,
    JwtProvider,
    KeyClientProvider,
    KeyVaultProvider,
    LoggerProvider,
    VirtualAuthenticatorProvdier,
    WebAuthnCredentialRepositoryProvider,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes('/api');
  }
}
