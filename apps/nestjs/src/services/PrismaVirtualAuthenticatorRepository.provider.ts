import { Provider } from '@nestjs/common';
import { PrismaVirtualAuthenticatorRepository } from '@repo/virtual-authenticator/repositories';

import { PrismaService } from './Prisma.service';

export const PrismaVirtualAuthenticatorRepositoryProvider: Provider = {
  provide: PrismaVirtualAuthenticatorRepository,
  useFactory: (prisma: PrismaService) => {
    const prismaVirtualAuthenticatorRepository =
      new PrismaVirtualAuthenticatorRepository({
        prisma,
      });

    return prismaVirtualAuthenticatorRepository;
  },
  inject: [PrismaService],
};
