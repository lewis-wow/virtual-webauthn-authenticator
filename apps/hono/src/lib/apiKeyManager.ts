import { ApiKeyManager } from '@repo/api-key';

import { prisma } from './prisma';
import { Lazy } from './utils/Lazy';

export const apiKeyManager = new Lazy(
  'apiKeyManager',
  async () =>
    new ApiKeyManager({
      prisma: await prisma.resolve(),
      encryptionKey: 'secret',
    }),
);
