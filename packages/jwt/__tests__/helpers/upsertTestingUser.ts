import { PrismaClient } from '@repo/prisma';

import { USER_EMAIL, USER_ID, USER_NAME } from './consts';

export const upsertTestingUser = async (opts: { prisma: PrismaClient }) => {
  const { prisma } = opts;

  const user = await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: {
      id: USER_ID,
      name: USER_NAME,
      email: USER_EMAIL,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
  });

  return user;
};
