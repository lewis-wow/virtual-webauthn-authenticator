import { Provider } from '@nestjs/common';
import {
  CredPropsExtension,
  ExtensionProcessor,
  ExtensionRegistry,
  VirtualAuthenticator,
  VirtualAuthenticatorAgent,
} from '@repo/virtual-authenticator';

export const VirtualAuthenticatorAgentProvider: Provider = {
  provide: VirtualAuthenticatorAgent,
  useFactory: (authenticator: VirtualAuthenticator) => {
    const extensionRegistry = new ExtensionRegistry().registerAll([
      new CredPropsExtension(),
    ]);
    const extensionProcessor = new ExtensionProcessor(extensionRegistry);

    const virtualAuthenticatorAgent = new VirtualAuthenticatorAgent({
      authenticator,
      extensionProcessor,
    });

    return virtualAuthenticatorAgent;
  },
  inject: [VirtualAuthenticator],
};
