import { Provider } from '@nestjs/common';
import { AzureKeyVaultKeyProvider } from '@repo/key-vault';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import {
  AttestationHandlerRegistry,
  AttestationProcessor,
  AuthorizationGesture,
  NoneAttestationHandler,
  PackedAttestationHandler,
} from '@repo/virtual-authenticator/authenticator';
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
    const authorizationGesture = new AuthorizationGesture({
      virtualAuthenticatorRepository,
    });

    const attestationHandlerRegistry =
      new AttestationHandlerRegistry().registerAll([
        new NoneAttestationHandler(),
        new PackedAttestationHandler({ keyProvider: azureKeyVaultKeyProvider }),
      ]);
    const attestationProcessor = new AttestationProcessor(
      attestationHandlerRegistry,
    );

    const virtualAuthenticator = new VirtualAuthenticator({
      webAuthnRepository,
      keyProvider: azureKeyVaultKeyProvider,
      virtualAuthenticatorRepository,
      authorizationGesture,
      attestationProcessor,
    });

    return virtualAuthenticator;
  },
  inject: [
    PrismaWebAuthnRepository,
    AzureKeyVaultKeyProvider,
    PrismaVirtualAuthenticatorRepository,
  ],
};
