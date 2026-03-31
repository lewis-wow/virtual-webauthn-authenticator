import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/validation';
import {
  DeleteWebAuthnPublicKeyCredentialResponseSchema,
  GetWebAuthnPublicKeyCredentialResponseSchema,
  ListWebAuthnPublicKeyCredentialsResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import { WebAuthnPublicKeyCredential } from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { WebAuthnPublicKeyCredentialNotFound } from '../exceptions/WebAuthnPublicKeyCredentialNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';
import { auditLog } from '../utils/AuditLog';
import { requirePermission } from '../utils/PermissionCheck';
import { handlePrismaNotFoundError } from '../utils/PrismaErrorHandler';

@Controller()
@UseFilters(ExceptionFilter)
export class WebAuthnPublicKeyCredentialsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly keyClient: KeyClient,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
  ) {}

  @TsRestHandler(nestjsContract.api.webAuthnPublicKeyCredentials.list)
  @UseGuards(AuthenticatedGuard)
  async listWebAuthnPublicKeyCredentials(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnPublicKeyCredentials.list,
      async ({ query }) => {
        const { userId, permissions } = jwtPayload;

        requirePermission(
          permissions,
          Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.READ'],
        );

        const pagination = new Pagination(async ({ pagination }) => {
          const webAuthnPublicKeyCredentials =
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

          return webAuthnPublicKeyCredentials as WebAuthnPublicKeyCredentialWithMeta[];
        });

        const result = await pagination.fetch({
          limit: query?.limit,
          cursor: query?.cursor,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: ListWebAuthnPublicKeyCredentialsResponseSchema[
            HttpStatusCode.OK_200
          ].encode(result),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.webAuthnPublicKeyCredentials.get)
  @UseGuards(AuthenticatedGuard)
  async getWebAuthnPublicKeyCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnPublicKeyCredentials.get,
      async ({ params }) => {
        const { userId, permissions } = jwtPayload;

        requirePermission(
          permissions,
          Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.READ'],
        );

        const webAuthnPublicKeyCredential =
          await this.prisma.webAuthnPublicKeyCredential.findUnique({
            where: {
              id: params.id,
              userId: userId,
            },
            include: {
              webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
            },
          });

        if (webAuthnPublicKeyCredential === null) {
          throw new WebAuthnPublicKeyCredentialNotFound();
        }

        return {
          status: HttpStatusCode.OK_200,
          body: GetWebAuthnPublicKeyCredentialResponseSchema[
            HttpStatusCode.OK_200
          ].encode(webAuthnPublicKeyCredential as WebAuthnPublicKeyCredential),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.webAuthnPublicKeyCredentials.delete)
  @UseGuards(AuthenticatedGuard)
  async deleteWebAuthnPublicKeyCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnPublicKeyCredentials.delete,
      async ({ params }) => {
        const { userId, permissions } = jwtPayload;

        requirePermission(
          permissions,
          Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.DELETE'],
        );

        let webAuthnPublicKeyCredential;
        try {
          webAuthnPublicKeyCredential =
            await this.prisma.webAuthnPublicKeyCredential.delete({
              where: {
                id: params.id,
                userId: userId,
              },
              include: {
                webAuthnPublicKeyCredentialKeyVaultKeyMeta: true,
              },
            });
        } catch (error) {
          handlePrismaNotFoundError({
            error,
            notFoundException: new WebAuthnPublicKeyCredentialNotFound(),
          });
          throw error;
        }

        this.logger.debug('Removing WebAuthnPublicKeyCredential.', {
          webAuthnPublicKeyCredential: webAuthnPublicKeyCredential,
          userId: userId,
        });

        if (
          webAuthnPublicKeyCredential.webAuthnPublicKeyCredentialKeyMetaType ===
          WebAuthnPublicKeyCredentialKeyMetaType.KEY_VAULT
        ) {
          const pollOperation = await this.keyClient.beginDeleteKey(
            webAuthnPublicKeyCredential
              .webAuthnPublicKeyCredentialKeyVaultKeyMeta!.keyVaultKeyName,
          );

          await pollOperation.pollUntilDone();
        }

        await auditLog({
          activityLog: this.activityLog,
          action: LogAction.DELETE,
          entity: LogEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL,
          jwtPayload,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: DeleteWebAuthnPublicKeyCredentialResponseSchema[
            HttpStatusCode.OK_200
          ].encode(webAuthnPublicKeyCredential as WebAuthnPublicKeyCredential),
        };
      },
    );
  }
}
