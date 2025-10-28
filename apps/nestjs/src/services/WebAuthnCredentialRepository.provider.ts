import { Provider } from '@nestjs/common';
import { WebAuthnCredentialRepository } from '@repo/key-vault';

import { PrismaService } from './Prisma.service';

export const WebAuthnCredentialRepositoryProvider: Provider = {
  provide: WebAuthnCredentialRepository,
  useFactory: (prisma: PrismaService) => {
    const webAuthnCredentialRepository = new WebAuthnCredentialRepository({
      prisma,
    });

    return webAuthnCredentialRepository;
  },
};
