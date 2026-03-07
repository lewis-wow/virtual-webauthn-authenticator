import { assertSchema } from '@repo/assert';
import type { PrismaClient } from '@repo/prisma';
import z from 'zod';

import { VirtualAuthenticatorNotFound } from '../../exceptions/VirtualAuthenticatorNotFound';
import type {
  FindUniqueArgs,
  IVirtualAuthenticatorRepository,
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

  async findUnique(opts: FindUniqueArgs) {
    const { virtualAuthenticatorId } = opts;

    assertSchema(virtualAuthenticatorId, z.string());

    const virtualAuthenticator =
      await this.prisma.virtualAuthenticator.findUnique({
        where: {
          id: virtualAuthenticatorId,
        },
      });

    if (virtualAuthenticator === null) {
      throw new VirtualAuthenticatorNotFound();
    }

    return virtualAuthenticator;
  }
}
