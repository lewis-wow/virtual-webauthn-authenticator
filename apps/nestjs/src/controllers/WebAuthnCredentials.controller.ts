import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/zod-validation';
import {
  DeleteWebAuthnCredentialResponseSchema,
  GetWebAuthnCredentialResponseSchema,
  ListWebAuthnCredentialsResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { Forbidden } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import { WebAuthnCredential } from '@repo/virtual-authenticator/zod-validation';
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
    private readonly keyClient: KeyClient,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
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
            await this.prisma.webAuthnPublicKeyCredential.findMany({
              where: {
                userId: userId,
                webAuthnPublicKeyCredentialKeyMetaType:
                  WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT,
              },
              include: {
                webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
              },
              ...pagination,
            });

          return webAuthnCredentials as WebAuthnPublicKeyCredentialWithMeta[];
        });

        const result = await pagination.fetch({
          limit: query?.limit,
          cursor: query?.cursor,
        });

        return {
          status: 200,
          body: ListWebAuthnCredentialsResponseSchema.encode(result),
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
          await this.prisma.webAuthnPublicKeyCredential.findUniqueOrThrow({
            where: {
              id: params.id,
              userId: userId,
            },
            include: {
              webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
            },
          });

        return {
          status: 200,
          body: GetWebAuthnCredentialResponseSchema.encode(
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

        const webAuthnCredential =
          await this.prisma.webAuthnPublicKeyCredential.delete({
            where: {
              id: params.id,
              userId: userId,
            },
            include: {
              webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
            },
          });

        this.logger.debug('Removing WebAuthnCredential.', {
          webAuthnCredential,
          userId: userId,
        });

        if (
          webAuthnCredential.webAuthnPublicKeyCredentialKeyMetaType ===
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT
        ) {
          const pollOperation = await this.keyClient.beginDeleteKey(
            webAuthnCredential.webAuthnPublicKeyCredentialKeyVaultKeyMeta!
              .keyVaultKeyName,
          );

          await pollOperation.pollUntilDone();
        }

        await this.activityLog.audit({
          action: LogAction.DELETE,
          entity: LogEntity.WEBAUTHN_CREDENTIAL,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: DeleteWebAuthnCredentialResponseSchema.encode(
            webAuthnCredential as WebAuthnCredential,
          ),
        };
      },
    );
  }
}
