import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { AuditLog } from '@repo/audit-log';
import { AuditLogAction, AuditLogEntity } from '@repo/audit-log/enums';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/validation';
import { nestjsContract } from '@repo/contract/nestjs';
import {
  DeleteWebAuthnCredentialResponseSchema,
  GetWebAuthnCredentialResponseSchema,
  ListWebAuthnCredentialsResponseSchema,
} from '@repo/contract/validation';
import { Forbidden } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnCredentialWithMeta } from '@repo/virtual-authenticator/types';
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
    private readonly auditLog: AuditLog,
  ) {}

  @TsRestHandler(nestjsContract.api.webAuthnCredentials.list)
  @UseGuards(AuthenticatedGuard)
  async listWebAuthnCredentials(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnCredentials.list,
      async ({ query }) => {
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['WebAuthnCredential.read'])) {
          throw new Forbidden();
        }

        const pagination = new Pagination(async ({ pagination }) => {
          const webAuthnCredentials =
            await this.prisma.webAuthnCredential.findMany({
              where: {
                userId: userId,
                webAuthnCredentialKeyMetaType:
                  WebAuthnCredentialKeyMetaType.KEY_VAULT,
              },
              include: {
                webAuthnCredentialKeyVaultKeyMeta: true,
              },
              ...pagination,
            });

          return webAuthnCredentials as WebAuthnCredentialWithMeta[];
        });

        const result = await pagination.fetch({
          limit: query.limit,
          cursor: query.cursor,
        });

        return {
          status: 200,
          body: Schema.encodeUnknownSync(ListWebAuthnCredentialsResponseSchema)(
            result,
          ),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.webAuthnCredentials.get)
  @UseGuards(AuthenticatedGuard)
  async getWebAuthnCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnCredentials.get,
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

        return {
          status: 200,
          body: Schema.encodeSync(GetWebAuthnCredentialResponseSchema)(
            webAuthnCredential as WebAuthnCredential,
          ),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.webAuthnCredentials.delete)
  @UseGuards(AuthenticatedGuard)
  async deleteWebAuthnCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnCredentials.delete,
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

        await this.auditLog.audit({
          action: AuditLogAction.DELETE,
          entity: AuditLogEntity.WEBAUTHN_CREDENTIAL,

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
