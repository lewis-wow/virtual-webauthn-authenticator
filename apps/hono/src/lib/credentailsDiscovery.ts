import { CredentialsDiscovery } from '@repo/credentials';

import { credentialsStore } from './credentialsStore';

export const credentialsDiscovery = new CredentialsDiscovery({
  credentialsStore,
});
