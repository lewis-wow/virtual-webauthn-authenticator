import { VirtualAuthenticator } from '@repo/credentials';

import { credentialsDiscovery } from './credentailsDiscovery';

export const virtualAuthenticator = new VirtualAuthenticator({
  credentialsDiscovery,
});
