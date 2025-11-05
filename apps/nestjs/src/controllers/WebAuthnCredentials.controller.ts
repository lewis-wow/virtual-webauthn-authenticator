import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyVault } from '@repo/key-vault';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnCredential, type JwtPayload } from '@repo/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { User } from '../decorators/User.decorator';
import { HTTPExceptionFilter } from '../filters/HTTPException.filter';
import { PrismaExceptionsFilter } from '../filters/PrismaExceptions.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new HTTPExceptionFilter(), new PrismaExceptionsFilter())
export class WebAuthnCredentialsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keyVault: KeyVault,
  ) {}

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
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        },
      );

      return {
        status: 200,
        body: contract.api.webAuthnCredentials.list.responses[200].encode(
          webAuthnCredentials as WebAuthnCredential[],
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
          body: contract.api.webAuthnCredentials.get.responses[200].encode(
            webAuthnCredential as WebAuthnCredential,
          ),
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
        const webAuthnCredential = await this.prisma.webAuthnCredential.delete({
          where: {
            id: params.id,
            userId: jwtPayload.id,
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        });

        if (
          webAuthnCredential.webAuthnCredentialKeyMetaType ===
          WebAuthnCredentialKeyMetaType.KEY_VAULT
        ) {
          await this.keyVault.deleteKey({
            keyName:
              webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta!
                .keyVaultKeyName,
          });
        }

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
