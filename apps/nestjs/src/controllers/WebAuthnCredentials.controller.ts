import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyVault } from '@repo/key-vault';
import { Logger } from '@repo/logger';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnCredential, type JwtPayload } from '@repo/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new ExceptionFilter())
export class WebAuthnCredentialsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keyVault: KeyVault,
    private readonly logger: Logger,
  ) {}

  @TsRestHandler(contract.api.webAuthnCredentials.list)
  @UseGuards(AuthenticatedGuard)
  async listWebAuthnCredentials(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.webAuthnCredentials.list, async () => {
      const { user } = jwtPayload;

      const webAuthnCredentials = await this.prisma.webAuthnCredential.findMany(
        {
          where: {
            userId: user.id,
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
  async getWebAuthnCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      contract.api.webAuthnCredentials.get,
      async ({ params }) => {
        const { user } = jwtPayload;

        const webAuthnCredential =
          await this.prisma.webAuthnCredential.findUniqueOrThrow({
            where: {
              id: params.id,
              userId: user.id,
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
  async deleteWebAuthnCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      contract.api.webAuthnCredentials.delete,
      async ({ params }) => {
        const { user } = jwtPayload;

        const webAuthnCredential = await this.prisma.webAuthnCredential.delete({
          where: {
            id: params.id,
            userId: user.id,
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        });

        this.logger.debug('Removing WebAuthnCredential.', {
          webAuthnCredential,
          userId: jwtPayload.id,
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
