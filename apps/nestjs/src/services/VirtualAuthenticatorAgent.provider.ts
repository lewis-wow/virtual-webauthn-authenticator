import { Provider } from '@nestjs/common';
import {
  VirtualAuthenticator,
  VirtualAuthenticatorAgent,
} from '@repo/virtual-authenticator';

export const VirtualAuthenticatorAgentProvider: Provider = {
  provide: VirtualAuthenticatorAgent,
  useFactory: (authenticator: VirtualAuthenticator) => {
    const virtualAuthenticatorAgent = new VirtualAuthenticatorAgent({
      authenticator,
    });

    return virtualAuthenticatorAgent;
  },
  inject: [VirtualAuthenticator],
};
