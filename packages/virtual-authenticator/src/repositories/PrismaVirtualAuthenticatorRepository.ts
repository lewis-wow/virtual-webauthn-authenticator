import { assertSchema } from '@repo/assert';
import type { PrismaClient } from '@repo/prisma';
import z from 'zod';

import { InvalidUserVerificationPin } from '../authenticator/exceptions/InvalidUserVerificationPin';
import { UnknownUserVerificationType } from '../authenticator/exceptions/UnknownUserVerificationType';
import { VirtualAuthenticatorUserVerificationType } from '../enums/VirtualAuthenticatorUserVerificationType';
import type {
  IVirtualAuthenticatorRepository,
  ValidatePinArgs,
} from './IVirtualAuthenticatorRepository';

export type PrismaVirtualAuthenticatorRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaVirtualAuthenticatorRepository
  implements IVirtualAuthenticatorRepository
{
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaVirtualAuthenticatorRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async validatePin(opts: ValidatePinArgs): Promise<boolean> {
    const { virtualAuthenticatorId, userId, pin } = opts;

    const authenticator = await this.prisma.virtualAuthenticator.findFirst({
      where: {
        id: virtualAuthenticatorId,
        userId,
      },
      select: { userVerificationType: true, pin: true },
    });

    if (!authenticator) {
      throw new InvalidUserVerificationPin();
    }

    switch (authenticator.userVerificationType) {
      case VirtualAuthenticatorUserVerificationType.NONE: {
        return true;
      }
      case VirtualAuthenticatorUserVerificationType.PIN: {
        assertSchema(pin, z.string().min(1));

        if (authenticator.pin !== pin) {
          throw new InvalidUserVerificationPin();
        }

        return true;
      }
      default: {
        throw new UnknownUserVerificationType();
      }
    }
  }
}
