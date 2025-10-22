import { VirtualAuthenticator } from '@repo/virtual-authenticator';

import { credentialsDiscovery } from './credentailsDiscovery';

export const virtualAuthenticator = new VirtualAuthenticator({
  credentialsDiscovery,
});
