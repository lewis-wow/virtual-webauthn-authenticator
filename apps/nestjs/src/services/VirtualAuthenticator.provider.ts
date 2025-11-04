import { Provider } from '@nestjs/common';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';

import { PrismaService } from './Prisma.service';

export const VirtualAuthenticatorProvider: Provider = {
  provide: VirtualAuthenticator,
  useFactory: (prisma: PrismaService) => {
    const virtualAuthenticator = new VirtualAuthenticator({ prisma });

    return virtualAuthenticator;
  },
  inject: [PrismaService],
};
