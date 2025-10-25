import { WebAuthnCredentialRepository } from '@repo/key-vault';

import { prisma } from './prisma';
import { Lazy } from './utils/lazy';

export const webAuthnCredentialRepository = new Lazy(
  'webAuthnCredentialRepository',
  async () =>
    new WebAuthnCredentialRepository({
      prisma: await prisma.resolve(),
    }),
);
