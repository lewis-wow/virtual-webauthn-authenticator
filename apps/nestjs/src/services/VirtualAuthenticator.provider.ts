import { Provider } from '@nestjs/common';
import { Jwt } from '@repo/crypto';
import { AzureKeyVaultKeyProvider } from '@repo/key-vault';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { PrismaWebAuthnRepository } from '@repo/virtual-authenticator/repositories';

export const VirtualAuthenticatorProvider: Provider = {
  provide: VirtualAuthenticator,
  useFactory: (
    webAuthnRepository: PrismaWebAuthnRepository,
    azureKeyVaultKeyProvider: AzureKeyVaultKeyProvider,
    jwt: Jwt,
  ) => {
    const virtualAuthenticator = new VirtualAuthenticator({
      webAuthnRepository,
      keyProvider: azureKeyVaultKeyProvider,
      jwt,
    });

    return virtualAuthenticator;
  },
  inject: [PrismaWebAuthnRepository, AzureKeyVaultKeyProvider, Jwt],
};
