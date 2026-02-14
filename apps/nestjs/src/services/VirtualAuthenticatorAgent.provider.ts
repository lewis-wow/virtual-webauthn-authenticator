import { Provider } from '@nestjs/common';
import { Jwks, Jwt } from '@repo/crypto';
import {
  CredPropsExtension,
  ExtensionProcessor,
  ExtensionRegistry,
  VirtualAuthenticator,
  VirtualAuthenticatorAgent,
} from '@repo/virtual-authenticator';
import { PrismaVirtualAuthenticatorJwksRepository } from '@repo/virtual-authenticator/repositories';
import { StateManager } from '@repo/virtual-authenticator/state';

import { Env, ENV_PROVIDER_TOKEN } from './Env.provider';
import { PrismaService } from './Prisma.service';

export const VirtualAuthenticatorAgentProvider: Provider = {
  provide: VirtualAuthenticatorAgent,
  useFactory: (
    env: Env,
    prisma: PrismaService,
    authenticator: VirtualAuthenticator,
  ) => {
    const extensionRegistry = new ExtensionRegistry().registerAll([
      new CredPropsExtension(),
    ]);

    const extensionProcessor = new ExtensionProcessor(extensionRegistry);

    const stateManager = new StateManager({
      jwt: new Jwt({
        jwks: new Jwks({
          encryptionKey: env.ENCRYPTION_KEY,
          jwksRepository: new PrismaVirtualAuthenticatorJwksRepository({
            prisma,
          }),
        }),
      }),
    });

    const virtualAuthenticatorAgent = new VirtualAuthenticatorAgent({
      authenticator,
      extensionProcessor,
      stateManager,
    });

    return virtualAuthenticatorAgent;
  },
  inject: [ENV_PROVIDER_TOKEN, PrismaService, VirtualAuthenticator],
};
