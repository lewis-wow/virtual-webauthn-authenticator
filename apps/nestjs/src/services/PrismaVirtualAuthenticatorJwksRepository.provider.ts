import { Provider } from '@nestjs/common';
import { PrismaVirtualAuthenticatorJwksRepository } from '@repo/virtual-authenticator/repositories';

import { PrismaService } from './Prisma.service';

export const PrismaVirtualAuthenticatorJwksRepositoryProvider: Provider = {
  provide: PrismaVirtualAuthenticatorJwksRepository,
  useFactory: (prisma: PrismaService) => {
    const prismaVirtualAuthenticatorJwksRepository =
      new PrismaVirtualAuthenticatorJwksRepository({
        prisma,
      });

    return prismaVirtualAuthenticatorJwksRepository;
  },
  inject: [PrismaService],
};
