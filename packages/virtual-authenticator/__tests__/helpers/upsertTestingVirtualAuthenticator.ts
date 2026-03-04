import { USER_ID } from '../../../auth/__tests__/helpers';

import type { PrismaClient } from '@repo/prisma';

import { VirtualAuthenticatorUserVerificationType } from '../../src/enums/VirtualAuthenticatorUserVerificationType';
import { VIRTUAL_AUTHENTICATOR_ID } from './consts';

export const upsertTestingVirtualAuthenticator = async (opts: {
  prisma: PrismaClient;
}) => {
  const { prisma } = opts;

  return await prisma.virtualAuthenticator.upsert({
    where: {
      id: VIRTUAL_AUTHENTICATOR_ID,
    },
    update: {},
    create: {
      id: VIRTUAL_AUTHENTICATOR_ID,
      userId: USER_ID,
      userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
      isActive: true,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
  });
};
