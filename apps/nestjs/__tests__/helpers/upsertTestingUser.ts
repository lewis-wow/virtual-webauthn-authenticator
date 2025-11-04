import { PrismaClient } from '@repo/prisma';

import { USER_EMAIL, USER_ID, USER_NAME } from './consts';

export const upsertTestingUser = async ({
  prisma,
}: {
  prisma: PrismaClient;
}) => {
  return await prisma.user.upsert({
    where: { id: USER_ID },
    update: {},
    create: { id: USER_ID, name: USER_NAME, email: USER_EMAIL },
  });
};
