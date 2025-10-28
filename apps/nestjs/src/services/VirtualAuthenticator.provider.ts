import { Provider } from '@nestjs/common';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';

export const VirtualAuthenticatorProvdier: Provider = {
  provide: VirtualAuthenticator,
  useFactory: () => {
    const virtualAuthenticator = new VirtualAuthenticator();

    return virtualAuthenticator;
  },
};
