import { VirtualAuthenticatorUserVerificationType as PrismaVirtualAuthenticatorUserVerificationType } from '@repo/prisma';

export const VirtualAuthenticatorUserVerificationType = {
  [PrismaVirtualAuthenticatorUserVerificationType.NONE]:
    PrismaVirtualAuthenticatorUserVerificationType.NONE,
  [PrismaVirtualAuthenticatorUserVerificationType.PIN]:
    PrismaVirtualAuthenticatorUserVerificationType.PIN,
} as const;
