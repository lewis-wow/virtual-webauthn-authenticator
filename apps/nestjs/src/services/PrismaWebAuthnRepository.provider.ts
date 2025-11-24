import { Provider } from '@nestjs/common';
import { PrismaWebAuthnRepository } from '@repo/virtual-authenticator/repositories';

import { PrismaService } from './Prisma.service';

export const PrismaWebAuthnRepositoryProvider: Provider = {
  provide: PrismaWebAuthnRepository,
  useFactory: (prisma: PrismaService) => {
    const prismaWebAuthnRepository = new PrismaWebAuthnRepository({
      prisma,
    });

    return prismaWebAuthnRepository;
  },
  inject: [PrismaService],
};
