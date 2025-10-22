import { CredentialsDiscovery, CredentialsStore } from '@repo/credentials';

import { prisma } from './prisma';

export const credentialsStore = new CredentialsStore({
  prisma,
});
