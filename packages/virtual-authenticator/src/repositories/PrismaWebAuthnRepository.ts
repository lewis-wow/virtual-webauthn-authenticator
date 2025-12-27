import { Prisma, PrismaClient } from '@repo/prisma';
import { assert, isArray, isString } from 'typanion';

import { WebAuthnCredentialKeyMetaType } from '../enums/WebAuthnCredentialKeyMetaType';
import { CredentialNotFound } from '../exceptions/CredentialNotFound';
import type { WebAuthnCredentialWithMeta } from '../types/WebAuthnCredentialWithMeta';
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

  // Helper method to map Prisma model to application type
  private mapPrismaToApp(prismaCredential: any): WebAuthnCredentialWithMeta {
    return {
      ...prismaCredential,
      webAuthnCredentialKeyMetaType:
        prismaCredential.webAuthnPublicKeyCredentialKeyMetaType,
      webAuthnCredentialKeyVaultKeyMeta:
        prismaCredential.webAuthnPublicKeyCredentialKeyVaultKeyMeta,
      webAuthnPublicKeyCredentialKeyMetaType: undefined,
      webAuthnPublicKeyCredentialKeyVaultKeyMeta: undefined,
    } as WebAuthnCredentialWithMeta;
  }

  async findAllByRpIdAndCredentialIds(opts: {
    rpId: string;
    credentialIds: string[];
  }): Promise<WebAuthnCredentialWithMeta[]> {
    const { rpId, credentialIds } = opts;

    assert(rpId, isString());
    assert(credentialIds, isArray(isString()));

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

    return webAuthnCredentialWithMetaList.map((cred) =>
      this.mapPrismaToApp(cred),
    );
  }

  async createKeyVaultWebAuthnCredential(
    data: CreateKeyVaultDataArgs,
  ): Promise<WebAuthnCredentialWithMeta> {
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
            create: { ...data.webAuthnCredentialKeyVaultKeyMeta },
          },
        },
        include: { webAuthnPublicKeyCredentialKeyVaultKeyMeta: true },
      });

    return this.mapPrismaToApp(createdWebAuthnCredentialWithMeta);
  }

  async findFirstAndIncrementCounterAtomicallyOrThrow(opts: {
    rpId: string;
    userId: string;
    apiKeyId: string | null;
    allowCredentialDescriptorList?: string[];
  }): Promise<WebAuthnCredentialWithMeta> {
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

    return this.mapPrismaToApp(updatedWebAuthnCredential);
  }
}
