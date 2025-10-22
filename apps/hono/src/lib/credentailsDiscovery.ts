import { CredentialsDiscovery } from '@repo/virtual-authenticator';

import { credentialsStore } from './credentialsStore';

export const credentialsDiscovery = new CredentialsDiscovery({
  credentialsStore,
});
