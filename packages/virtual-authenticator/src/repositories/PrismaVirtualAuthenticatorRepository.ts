import { assertSchema } from '@repo/assert';
import type { PrismaClient } from '@repo/prisma';
import z from 'zod';

import { InvalidUserVerificationPin } from '../authenticator/exceptions/InvalidUserVerificationPin';
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

    assertSchema(pin, z.string().min(1));

    const count = await this.prisma.virtualAuthenticator.count({
      where: {
        id: virtualAuthenticatorId,
        userId,
        pin,
      },
    });

    if (count === 0) {
      throw new InvalidUserVerificationPin();
    }

    return true;
  }
}
