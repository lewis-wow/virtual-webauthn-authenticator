import { Provider } from '@nestjs/common';
import { AzureKeyVaultKeyProvider } from '@repo/key-vault';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { PrismaWebAuthnRepository } from '@repo/virtual-authenticator/repositories';

import { PrismaService } from './Prisma.service';

export const VirtualAuthenticatorProvider: Provider = {
  provide: VirtualAuthenticator,
  useFactory: (
    webAuthnRepository: PrismaWebAuthnRepository,
    azureKeyVaultKeyProvider: AzureKeyVaultKeyProvider,
  ) => {
    const virtualAuthenticator = new VirtualAuthenticator({
      webAuthnRepository,
      keyProvider: azureKeyVaultKeyProvider,
    });

    return virtualAuthenticator;
  },
  inject: [PrismaService, AzureKeyVaultKeyProvider],
};
