import { Prisma, PrismaClient } from '@repo/prisma';

import { USER_EMAIL, USER_ID, USER_NAME } from './consts';

export const upsertTestingUser = async (opts: { prisma: PrismaClient }) => {
  const { prisma } = opts;

  try {
    // Try the upsert
    const user = await prisma.user.upsert({
      where: { id: USER_ID },
      update: {},
      create: { id: USER_ID, name: USER_NAME, email: USER_EMAIL },
    });
    return user;
  } catch (e) {
    // Check if the error is the expected race condition error
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      // The user was created by a parallel process.
      // We can now safely fetch the user.
      console.warn(`Prisma upsert race condition handled for user: ${USER_ID}`);
      // Use findUniqueOrThrow to ensure the user exists and return it
      return await prisma.user.findUniqueOrThrow({
        where: { id: USER_ID },
      });
    }

    // If it's any other error, re-throw it
    throw e;
  }
};
