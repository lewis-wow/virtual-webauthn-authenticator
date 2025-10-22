import {
  CredentialsDiscovery,
  CredentialsStore,
} from '@repo/virtual-authenticator';

import { prisma } from './prisma';

export const credentialsStore = new CredentialsStore({
  prisma,
});
