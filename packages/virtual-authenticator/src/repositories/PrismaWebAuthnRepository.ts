import { assertSchema } from '@repo/assert';
import { Prisma, PrismaClient } from '@repo/prisma';
import z from 'zod';

import { WebAuthnPublicKeyCredentialKeyMetaType } from '../enums/WebAuthnPublicKeyCredentialKeyMetaType';
import { ApiKeyNotExists } from '../exceptions/ApiKeyNotExists';
import { CredentialNotFound } from '../exceptions/CredentialNotFound';
import { UserNotExists } from '../exceptions/UserNotExists';
import type { WebAuthnPublicKeyCredentialWithMeta } from '../types/WebAuthnPublicKeyCredentialWithMeta';
import type { ApplicablePublicKeyCredential } from '../validation/spec/ApplicablePublicKeyCredentialSchema';
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

  async findAllApplicableCredentialsByRpIdAndUserWithAllowCredentialDescriptorList(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList: string[] | undefined;
  }): Promise<ApplicablePublicKeyCredential[]> {
    const { rpId, userId, apiKeyId, allowCredentialDescriptorList } = opts;

    assertSchema(rpId, z.string());
    assertSchema(userId, z.string());
    assertSchema(apiKeyId, z.string().nullable());
    assertSchema(allowCredentialDescriptorList, z.array(z.string()).optional());

    const webAuthnPublicKeyCredentialCandidates =
      await this.prisma.webAuthnPublicKeyCredential.findMany({
        where: {
          userId,
          rpId,
          apiKeyId,
          id: {
            in: allowCredentialDescriptorList,
          },
        },
        select: {
          id: true,
          name: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

    return webAuthnPublicKeyCredentialCandidates.map(
      (webAuthnPublicKeyCredentialCandidate) => ({
        id: webAuthnPublicKeyCredentialCandidate.id,
        name: webAuthnPublicKeyCredentialCandidate.name,
        userId: webAuthnPublicKeyCredentialCandidate.user.id,
        userDisplayName: webAuthnPublicKeyCredentialCandidate.user.name,
        userEmail: webAuthnPublicKeyCredentialCandidate.user.email,
      }),
    );
  }

  async incrementCounter(opts: {
    credentialId: string;
  }): Promise<WebAuthnPublicKeyCredentialWithMeta> {
    const { credentialId } = opts;

    assertSchema(credentialId, z.string());

    const webAuthnPublicKeyCredentialWithMeta =
      await this.prisma.webAuthnPublicKeyCredential.update({
        where: {
          id: credentialId,
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

    return webAuthnPublicKeyCredentialWithMeta as WebAuthnPublicKeyCredentialWithMeta;
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
            isClientSideDiscoverable: data.isClientSideDiscoverable,

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
