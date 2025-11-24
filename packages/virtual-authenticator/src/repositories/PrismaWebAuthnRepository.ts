import { Prisma, PrismaClient } from '@repo/prisma';
import { assert, isArray, isNullable, isOptional, isString } from 'typanion';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { CredentialNotFound } from '../exceptions';
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

  async findFirstAndIncrementCounterAtomicallyOrThrow(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null | undefined;
    allowCredentialIds?: string[];
  }): Promise<WebAuthnCredentialWithMeta> {
    const { rpId, userId, allowCredentialIds, apiKeyId } = opts;

    assert(rpId, isString());
    assert(userId, isString());
    assert(apiKeyId, isOptional(isNullable(isString())));
    assert(allowCredentialIds, isOptional(isArray(isString())));

    const where: Prisma.WebAuthnCredentialWhereInput = {
      rpId,
      userId,
      apiKeyId,
    };

    if (allowCredentialIds && allowCredentialIds.length > 0) {
      where.id = {
        in: allowCredentialIds,
      };
    }

    const updatedWebAuthnCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnCredential = await tx.webAuthnCredential.findFirst({
          where,
        });

        if (webAuthnCredential === null) {
          throw new CredentialNotFound({
            data: {
              userId,
              allowCredentialIds,
              rpId,
            },
          });
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

    return updatedWebAuthnCredential as WebAuthnCredentialWithMeta;
  }
}
