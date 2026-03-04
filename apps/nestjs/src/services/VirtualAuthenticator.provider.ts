import { Provider } from '@nestjs/common';
import { AzureKeyVaultKeyProvider } from '@repo/key-vault';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import {
  PrismaVirtualAuthenticatorRepository,
  PrismaWebAuthnRepository,
} from '@repo/virtual-authenticator/repositories';

export const VirtualAuthenticatorProvider: Provider = {
  provide: VirtualAuthenticator,
  useFactory: (
    webAuthnRepository: PrismaWebAuthnRepository,
    azureKeyVaultKeyProvider: AzureKeyVaultKeyProvider,
    virtualAuthenticatorRepository: PrismaVirtualAuthenticatorRepository,
  ) => {
    const virtualAuthenticator = new VirtualAuthenticator({
      webAuthnRepository,
      keyProvider: azureKeyVaultKeyProvider,
      virtualAuthenticatorRepository,
    });

    return virtualAuthenticator;
  },
  inject: [
    PrismaWebAuthnRepository,
    AzureKeyVaultKeyProvider,
    PrismaVirtualAuthenticatorRepository,
  ],
};
