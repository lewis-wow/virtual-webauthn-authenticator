import { initializePrismaClient } from '@repo/prisma';

import { Lazy } from './utils/lazy';

export const prisma = new Lazy('prisma', () => {
  return initializePrismaClient();
});
