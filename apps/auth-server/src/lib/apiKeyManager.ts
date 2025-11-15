import { ApiKeyManager } from '@repo/auth';

import { prisma } from './prisma';

export const apiKeyManager = new ApiKeyManager({
  prisma,
});
