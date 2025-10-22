import { KeyVault } from '@repo/key-vault';

import { cryptographyClientFactory } from './cryptographyClientFactory';
import { keyClient } from './keyClient';
import { prisma } from './prisma';

export const keyVault = new KeyVault({
  keyClient,
  cryptographyClientFactory,
  prisma,
});
