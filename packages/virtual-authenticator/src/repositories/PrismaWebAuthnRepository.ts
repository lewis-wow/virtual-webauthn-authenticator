import { assertSchema } from '@repo/assert';
import { Prisma, PrismaClient } from '@repo/prisma';
import z from 'zod';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { CredentialNotFound } from '../exceptions/CredentialNotFound';
import type { WebAuthnPublicKeyCredentialWithMeta } from '../types/WebAuthnPublicKeyCredentialWithMeta';
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

  async findAllByRpIdAndCredentialIds(opts: {
    rpId: string;
    credentialIds: string[];
  }): Promise<WebAuthnPublicKeyCredentialWithMeta[]> {
    const { rpId, credentialIds } = opts;

    assertSchema(rpId, z.string());
    assertSchema(credentialIds, z.array(z.string()));

    if (credentialIds.length === 0) {
      return [];
    }

    const webAuthnCredentialWithMetaList =
      await this.prisma.webAuthnPublicKeyCredential.findMany({
        where: {
          rpId: rpId,
          id: {
            in: credentialIds,
          },
        },
        include: {
          webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
        },
      });

    return webAuthnCredentialWithMetaList as WebAuthnPublicKeyCredentialWithMeta[];
  }

  async createKeyVaultWebAuthnCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnPublicKeyCredentialWithMeta> {
    const createdWebAuthnCredentialWithMeta =
      await this.prisma.webAuthnPublicKeyCredential.create({
        data: {
          id: data.id,

          COSEPublicKey: data.COSEPublicKey,
          rpId: data.rpId,

          counter: 0,

          userId: data.userId,
          apiKeyId: data.apiKeyId,

          webAuthnPublicKeyCredentialKeyMetaType:
            WebAuthnCredentialKeyMetaType.KEY_VAULT,
          webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
            create: { ...data.webAuthnPublicKeyCredentialKeyVaultKeyMeta },
          },
        },
        include: { webAuthnPublicKeyCredentialKeyVaultKeyMeta: true },
      });

    return createdWebAuthnCredentialWithMeta as WebAuthnPublicKeyCredentialWithMeta;
  }

  async findFirstAndIncrementCounterAtomicallyOrThrow(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList?: string[];
  }): Promise<WebAuthnPublicKeyCredentialWithMeta> {
    const { rpId, userId, allowCredentialDescriptorList, apiKeyId } = opts;

    const where: Prisma.WebAuthnPublicKeyCredentialWhereInput = {
      rpId,
      userId,
      apiKeyId,
    };

    if (
      allowCredentialDescriptorList &&
      allowCredentialDescriptorList.length > 0
    ) {
      where.id = {
        in: allowCredentialDescriptorList,
      };
    }

    const updatedWebAuthnCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnCredential =
          await tx.webAuthnPublicKeyCredential.findFirst({
            where,
          });

        if (webAuthnCredential === null) {
          throw new CredentialNotFound();
        }

        return await tx.webAuthnPublicKeyCredential.update({
          where: {
            id: webAuthnCredential.id,
          },
          data: {
            counter: {
              increment: 1,
            },
          },
          include: {
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
          },
        });
      },
    );

    return updatedWebAuthnCredential as WebAuthnPublicKeyCredentialWithMeta;
  }
}
