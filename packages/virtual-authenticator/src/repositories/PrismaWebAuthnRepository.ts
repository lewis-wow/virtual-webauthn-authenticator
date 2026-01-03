import { assertSchema } from '@repo/assert';
import { Prisma, PrismaClient } from '@repo/prisma';
import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { ApiKeyNotExists } from '../exceptions/ApiKeyNotExists';
import { CredentialNotFound } from '../exceptions/CredentialNotFound';
import { UserNotExists } from '../exceptions/UserNotExists';
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

    const webAuthnPublicKeyCredentialWithMetaList =
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

    return webAuthnPublicKeyCredentialWithMetaList as WebAuthnPublicKeyCredentialWithMeta[];
  }

  async createKeyVaultWebAuthnPublicKeyCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnPublicKeyCredentialWithMeta> {
    try {
      const createdWebAuthnPublicKeyCredentialWithMeta =
        await this.prisma.webAuthnPublicKeyCredential.create({
          data: {
            id: data.id,
            name: data.name,

            COSEPublicKey: data.COSEPublicKey,
            rpId: data.rpId,

            counter: 0,

            userId: data.userId,
            apiKeyId: data.apiKeyId,

            webAuthnPublicKeyCredentialKeyMetaType:
              WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
            webAuthnPublicKeyCredentialKeyVaultKeyMeta: {
              create: { ...data.webAuthnPublicKeyCredentialKeyVaultKeyMeta },
            },
          },
          include: { webAuthnPublicKeyCredentialKeyVaultKeyMeta: true },
        });

      return createdWebAuthnPublicKeyCredentialWithMeta as WebAuthnPublicKeyCredentialWithMeta;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003 is the error code for "Foreign key constraint failed"
        if (error.code === 'P2003') {
          // Prisma usually provides the field that failed in 'meta.field_name'
          // Note: The format of this field depends on your specific database (Postgres/MySQL/etc)
          const failedConstraint = error.meta?.constraint as string;

          if (failedConstraint?.includes('userId')) {
            throw new UserNotExists();
          }

          if (failedConstraint?.includes('apiKeyId')) {
            throw new ApiKeyNotExists();
          }
        }
      }

      throw error;
    }
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

    if (allowCredentialDescriptorList !== undefined) {
      where.id = {
        in: allowCredentialDescriptorList,
      };
    }

    const updatedWebAuthnPublicKeyCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnPublicKeyCredential =
          await tx.webAuthnPublicKeyCredential.findFirst({
            where,
          });

        if (webAuthnPublicKeyCredential === null) {
          throw new CredentialNotFound();
        }

        return await tx.webAuthnPublicKeyCredential.update({
          where: {
            id: webAuthnPublicKeyCredential.id,
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

    return updatedWebAuthnPublicKeyCredential as WebAuthnPublicKeyCredentialWithMeta;
  }
}
