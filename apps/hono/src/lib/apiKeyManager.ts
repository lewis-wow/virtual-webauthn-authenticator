import { ApiKeyManager } from '@repo/api-key';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const apiKeyManager = new Lazy(
  'apiKeyManager',
  async () =>
    new ApiKeyManager({
      prisma: await prisma.resolve(),
    }),
);
