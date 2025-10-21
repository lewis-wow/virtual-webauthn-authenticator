import type { PrismaClient, Prisma, WebAuthnCredential } from '@repo/prisma';
import type { PublicKeyCredentialRequestOptions } from '@repo/validation';
import {
  assert,
  isInstanceOf,
  isArray,
  isOptional,
  isObject,
  isString,
  hasMinLength,
  cascade,
  isPartial,
} from 'typanion';
import type { PickDeep } from 'type-fest';

export type CredentialDiscoveryOptions = {
  prisma: PrismaClient;
};

export class CredentialDiscovery {
  private readonly prisma: PrismaClient;

  constructor(opts: CredentialDiscoveryOptions) {
    this.prisma = opts.prisma;
  }

  private _pickSelectedCredentialCandidate(
    candidates: WebAuthnCredential[],
  ): WebAuthnCredential {
    assert(
      candidates,
      cascade(isArray(isObject({ id: isString() })), hasMinLength(1)),
    );

    return candidates[0]!;
  }

  async selectCredentialAndUpdateCounter(
    opts: PickDeep<
      PublicKeyCredentialRequestOptions,
      `allowCredentials.${number}.id` | 'rpId'
    >,
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
    };

    if (allowCredentials && allowCredentials.length > 0) {
      const allowedIDs = allowCredentials.map((publicKeyCredentialDescriptor) =>
        publicKeyCredentialDescriptor.id.toString('base64url'),
      );

      where.credentialIDbase64url = {
        in: allowedIDs,
      };
    }

    const selectedCredential = await this.prisma.$transaction(async (tx) => {
      const candidates = await tx.webAuthnCredential.findMany({
        where,
      });

      const selectedCredential =
        this._pickSelectedCredentialCandidate(candidates);

      return await tx.webAuthnCredential.update({
        where: {
          id: selectedCredential.id,
        },
        data: {
          counter: {
            increment: 1,
          },
        },
      });
    });

    return selectedCredential;
  }
}
