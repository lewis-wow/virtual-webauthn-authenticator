import { WebAuthnCredentialRepository } from '@repo/key-vault';

import { prisma } from './prisma';

export const webAuthnCredentialRepository = new WebAuthnCredentialRepository({
  prisma,
});
