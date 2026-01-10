import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/zod-validation';
import {
  DeleteWebAuthnPublicKeyCredentialResponseSchema,
  GetWebAuthnPublicKeyCredentialResponseSchema,
  ListWebAuthnPublicKeyCredentialsResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { Forbidden } from '@repo/exception/http';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { Prisma, WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/prisma';
import { PrismaErrorCode } from '@repo/prisma/enums';
import { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import { WebAuthnPublicKeyCredential } from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { WebAuthnPublicKeyCredentialNotFound } from '../exceptions/WebAuthnPublicKeyCredentialNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

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

        if (
          !permissions.includes(
            Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.READ'],
          )
        ) {
          throw new Forbidden();
        }

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
          status: HttpStatusCode.OK,
          body: ListWebAuthnPublicKeyCredentialsResponseSchema[
            HttpStatusCode.OK
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

        if (
          !permissions.includes(
            Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.READ'],
          )
        ) {
          throw new Forbidden();
        }

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
          status: HttpStatusCode.OK,
          body: GetWebAuthnPublicKeyCredentialResponseSchema[
            HttpStatusCode.OK
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

        if (
          !permissions.includes(
            Permission['WEB_AUTHN_PUBLIC_KEY_CREDENTIAL.DELETE'],
          )
        ) {
          throw new Forbidden();
        }

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
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === PrismaErrorCode.RECORDS_NOT_FOUND) {
              throw new WebAuthnPublicKeyCredentialNotFound();
            }
          }

          // Handle other errors (db connection issues, etc.)
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

        await this.activityLog.audit({
          action: LogAction.DELETE,
          entity: LogEntity.WEB_AUTHN_PUBLIC_KEY_CREDENTIAL,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: HttpStatusCode.OK,
          body: DeleteWebAuthnPublicKeyCredentialResponseSchema[
            HttpStatusCode.OK
          ].encode(webAuthnPublicKeyCredential as WebAuthnPublicKeyCredential),
        };
      },
    );
  }
}
