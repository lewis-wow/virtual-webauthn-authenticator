import { Prisma, PrismaClient } from '@repo/prisma';
import { assert, isArray, isNullable, isOptional, isString } from 'typanion';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import type { WebAuthnCredentialWithMeta } from '../types';
import type {
  CreateKeyVaultDataArgs,
  IWebAuthnRepository,
} from './IWebAuthnRepository';

export type PrismaWebAuthnRepositoryOptions = {
  prisma: PrismaClient;
};

export class PrismaWebAuthnRepository implements IWebAuthnRepository {
  private readonly prisma: PrismaClient;

  constructor(opts: PrismaWebAuthnRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async createKeyVaultWebAuthnCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnCredentialWithMeta> {
    const createdWebAuthnCredentialWithMeta =
      await this.prisma.webAuthnCredential.create({
        data: {
          id: data.id,

          COSEPublicKey: data.COSEPublicKey,
          rpId: data.rpId,

          counter: 0,

          userId: data.userId,
          apiKeyId: data.apiKeyId,

          webAuthnCredentialKeyMetaType:
            WebAuthnCredentialKeyMetaType.KEY_VAULT,
          webAuthnCredentialKeyVaultKeyMeta: {
            create: { ...data.webAuthnCredentialKeyVaultKeyMeta },
          },
        },
        include: { webAuthnCredentialKeyVaultKeyMeta: true },
      });

    return createdWebAuthnCredentialWithMeta as WebAuthnCredentialWithMeta;
  }

  async findFirstAndIncrementCounterAtomically(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentials?: string[];
  }): Promise<WebAuthnCredentialWithMeta | null> {
    const { rpId, userId, allowCredentials, apiKeyId } = opts;

    assert(rpId, isString());
    assert(userId, isString());
    assert(apiKeyId, isNullable(isString()));
    assert(allowCredentials, isOptional(isArray(isString())));

    const where: Prisma.WebAuthnCredentialWhereInput = {
      rpId,
      userId,
      apiKeyId,
    };

    if (allowCredentials && allowCredentials.length > 0) {
      where.id = {
        in: allowCredentials,
      };
    }

    const updatedWebAuthnCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnCredential = await tx.webAuthnCredential.findFirst({
          where,
        });

        if (webAuthnCredential === null) {
          return null;
        }

        return await tx.webAuthnCredential.update({
          where: {
            id: webAuthnCredential.id,
          },
          data: {
            counter: {
              increment: 1,
            },
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        });
      },
    );

    return updatedWebAuthnCredential as WebAuthnCredentialWithMeta | null;
  }
}
