import { Provider } from '@nestjs/common';
import { AzureKeyVaultKeyProvider } from '@repo/key-vault';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';

import { PrismaService } from './Prisma.service';

export const VirtualAuthenticatorProvider: Provider = {
  provide: VirtualAuthenticator,
  useFactory: (
    prisma: PrismaService,
    azureKeyVaultKeyProvider: AzureKeyVaultKeyProvider,
  ) => {
    const virtualAuthenticator = new VirtualAuthenticator({
      prisma,
      keyProvider: azureKeyVaultKeyProvider,
    });

    return virtualAuthenticator;
  },
  inject: [PrismaService, AzureKeyVaultKeyProvider],
};
