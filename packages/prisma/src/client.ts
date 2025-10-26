import { withAccelerate } from '@prisma/extension-accelerate';

import { PrismaClient } from './generated/client/client';

export const initializePrismaClient = () => {
  const globalForPrisma = global as unknown as { prisma: PrismaClient };

  const prisma =
    globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

  return prisma;
};
