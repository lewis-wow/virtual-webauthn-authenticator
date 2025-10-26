import { initializePrismaClient } from '@repo/prisma';

import { Lazy } from './utils/Lazy';

export const prisma = new Lazy('prisma', () => {
  return initializePrismaClient();
});
