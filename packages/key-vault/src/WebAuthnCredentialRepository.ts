import type {
  Prisma,
  PrismaClient,
  User,
  WebAuthnCredential,
} from '@repo/prisma';
import type { PublicKeyCredentialRequestOptions } from '@repo/validation';
import {
  assert,
  isArray,
  isInstanceOf,
  isOptional,
  isPartial,
  isString,
} from 'typanion';
import type { PickDeep } from 'type-fest';

export type WebAuthnCredentialRepositoryOptions = {
  prisma: PrismaClient;
};

export class WebAuthnCredentialRepository {
  private readonly prisma: PrismaClient;

  constructor(opts: WebAuthnCredentialRepositoryOptions) {
    this.prisma = opts.prisma;
  }

  async findFirstAndIncrementCounterAtomically(
    where: Prisma.WebAuthnCredentialWhereInput,
  ): Promise<WebAuthnCredential> {
    const updatedWebAuthnCredential = await this.prisma.$transaction(
      async (tx) => {
        const webAuthnCredential = await tx.webAuthnCredential.findFirstOrThrow(
          {
            where,
          },
        );

        return await tx.webAuthnCredential.update({
          where: {
            id: webAuthnCredential.id,
          },
          data: {
            counter: {
              increment: 1,
            },
          },
        });
      },
    );

    return updatedWebAuthnCredential;
  }

  async findFirstMatchingCredentialAndIncrementCounterAtomically(
    opts: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >,
    user: Pick<User, 'id'>,
  ): Promise<WebAuthnCredential> {
    const { rpId, allowCredentials } = opts;

    assert(rpId, isString());
    assert(
      allowCredentials,
      isOptional(
        isArray(
          isPartial({
            id: isInstanceOf(Buffer),
          }),
        ),
      ),
    );

    const where: Prisma.WebAuthnCredentialWhereInput = {
      rpId,
      userId: user.id,
    };

    if (allowCredentials && allowCredentials.length > 0) {
      const allowedIDs = allowCredentials.map((publicKeyCredentialDescriptor) =>
        publicKeyCredentialDescriptor.id.toString('base64url'),
      );

      where.id = {
        in: allowedIDs,
      };
    }

    const webAuthnCredential =
      await this.findFirstAndIncrementCounterAtomically(where);

    return webAuthnCredential;
  }
}
