import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { type JwtPayload } from '@repo/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { User } from '../decorators/User.decorator';
import { HTTPExceptionFilter } from '../filters/HTTPException.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new HTTPExceptionFilter())
export class WebAuthnCredentialsController {
  constructor(private readonly prisma: PrismaService) {}

  @TsRestHandler(contract.api.webAuthnCredentials.list)
  @UseGuards(AuthenticatedGuard)
  async listWebAuthnCredentials(@User() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.webAuthnCredentials.list, async () => {
      const webAuthnCredentials = await this.prisma.webAuthnCredential.findMany(
        {
          where: {
            userId: jwtPayload.id,
            webAuthnCredentialKeyMetaType:
              WebAuthnCredentialKeyMetaType.KEY_VAULT,
            webAuthnCredentialKeyVaultKeyMeta: {
              isNot: null,
            },
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        },
      );

      return {
        status: 200,
        body: contract.api.webAuthnCredentials.list.responses[200].encode(
          webAuthnCredentials.map((webAuthnCredential) => ({
            ...webAuthnCredential,
            COSEPublicKey:
              webAuthnCredential.COSEPublicKey as Uint8Array<ArrayBuffer>,
            webAuthnCredentialKeyVaultKeyMeta:
              webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta!,
          })),
        ),
      };
    });
  }

  @TsRestHandler(contract.api.webAuthnCredentials.get)
  @UseGuards(AuthenticatedGuard)
  async getWebAuthnCredential(@User() jwtPayload: JwtPayload) {
    return tsRestHandler(
      contract.api.webAuthnCredentials.get,
      async ({ params }) => {
        const webAuthnCredential =
          await this.prisma.webAuthnCredential.findUniqueOrThrow({
            where: {
              id: params.id,
              userId: jwtPayload.id,
            },
            include: {
              webAuthnCredentialKeyVaultKeyMeta: true,
            },
          });

        return {
          status: 200,
          body: contract.api.webAuthnCredentials.get.responses[200].encode({
            ...webAuthnCredential,
            COSEPublicKey:
              webAuthnCredential.COSEPublicKey as Uint8Array<ArrayBuffer>,
            webAuthnCredentialKeyVaultKeyMeta:
              webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta!,
          }),
        };
      },
    );
  }

  @TsRestHandler(contract.api.webAuthnCredentials.delete)
  @UseGuards(AuthenticatedGuard)
  async deleteWebAuthnCredential(@User() jwtPayload: JwtPayload) {
    return tsRestHandler(
      contract.api.webAuthnCredentials.delete,
      async ({ params }) => {
        await this.prisma.webAuthnCredential.delete({
          where: {
            id: params.id,
            userId: jwtPayload.id,
          },
        });

        return {
          status: 200,
          body: contract.api.webAuthnCredentials.delete.responses[200].encode({
            success: true,
          }),
        };
      },
    );
  }
}
