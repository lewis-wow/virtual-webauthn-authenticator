import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/validation';
import { contract } from '@repo/contract';
import {
  DeleteWebAuthnCredentialResponseSchema,
  GetWebAuthnCredentialResponseSchema,
  ListWebAuthnCredentialsResponseSchema,
} from '@repo/contract/validation';
import { EventLog } from '@repo/event-log';
import { EventLogAction, EventLogEntity } from '@repo/event-log/enums';
import { Forbidden } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnCredential } from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new ExceptionFilter())
export class WebAuthnCredentialsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keyClient: KeyClient,
    private readonly logger: Logger,
    private readonly eventLog: EventLog,
  ) {}

  @TsRestHandler(contract.api.webAuthnCredentials.list)
  @UseGuards(AuthenticatedGuard)
  async listWebAuthnCredentials(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.webAuthnCredentials.list, async () => {
      const { userId, permissions } = jwtPayload;

      if (!permissions.includes(Permission['WebAuthnCredential.read'])) {
        throw new Forbidden();
      }

      const webAuthnCredentials = await this.prisma.webAuthnCredential.findMany(
        {
          where: {
            userId: userId,
            webAuthnCredentialKeyMetaType:
              WebAuthnCredentialKeyMetaType.KEY_VAULT,
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        },
      );

      await this.eventLog.log({
        action: EventLogAction.LIST,
        entity: EventLogEntity.WEBAUTHN_CREDENTIAL,

        apiKeyId:
          jwtPayload.tokenType === TokenType.API_KEY
            ? jwtPayload.apiKeyId
            : undefined,
        userId: jwtPayload.userId,
      });

      return {
        status: 200,
        body: Schema.encodeSync(ListWebAuthnCredentialsResponseSchema)(
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
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['WebAuthnCredential.read'])) {
          throw new Forbidden();
        }

        const webAuthnCredential =
          await this.prisma.webAuthnCredential.findUniqueOrThrow({
            where: {
              id: params.id,
              userId: userId,
            },
            include: {
              webAuthnCredentialKeyVaultKeyMeta: true,
            },
          });

        await this.eventLog.log({
          action: EventLogAction.GET,
          entity: EventLogEntity.WEBAUTHN_CREDENTIAL,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: Schema.encodeSync(GetWebAuthnCredentialResponseSchema)(
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
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['WebAuthnCredential.delete'])) {
          throw new Forbidden();
        }

        const webAuthnCredential = await this.prisma.webAuthnCredential.delete({
          where: {
            id: params.id,
            userId: userId,
          },
          include: {
            webAuthnCredentialKeyVaultKeyMeta: true,
          },
        });

        this.logger.debug('Removing WebAuthnCredential.', {
          webAuthnCredential,
          userId: userId,
        });

        if (
          webAuthnCredential.webAuthnCredentialKeyMetaType ===
          WebAuthnCredentialKeyMetaType.KEY_VAULT
        ) {
          const pollOperation = await this.keyClient.beginDeleteKey(
            webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta!
              .keyVaultKeyName,
          );

          await pollOperation.pollUntilDone();
        }

        await this.eventLog.log({
          action: EventLogAction.DELETE,
          entity: EventLogEntity.WEBAUTHN_CREDENTIAL,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: Schema.encodeSync(DeleteWebAuthnCredentialResponseSchema)(
            webAuthnCredential as WebAuthnCredential,
          ),
        };
      },
    );
  }
}
