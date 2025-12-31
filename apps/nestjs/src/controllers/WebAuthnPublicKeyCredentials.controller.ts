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
import { Prisma, WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/prisma';
import { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import { WebAuthnCredential } from '@repo/virtual-authenticator/zod-validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { WebAuthnPublicKeyCredentialNotFound } from '../exceptions/WebAuthnPublicKeyCredentialNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new ExceptionFilter())
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

  @TsRestHandler(nestjsContract.api.webAuthnPublicKeyCredentials.get)
  @UseGuards(AuthenticatedGuard)
  async getWebAuthnPublicKeyCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.webAuthnPublicKeyCredentials.get,
      async ({ params }) => {
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['WebAuthnCredential.read'])) {
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
          status: 200,
          body: GetWebAuthnCredentialResponseSchema.encode(
            webAuthnPublicKeyCredential as WebAuthnCredential,
          ),
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

        if (!permissions.includes(Permission['WebAuthnCredential.delete'])) {
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
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError) {
            if (e.code === 'P2025') {
              throw new WebAuthnPublicKeyCredentialNotFound();
            }
          }

          // Handle other errors (db connection issues, etc.)
          throw e;
        }

        this.logger.debug('Removing WebAuthnCredential.', {
          webAuthnCredential: webAuthnPublicKeyCredential,
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
            webAuthnPublicKeyCredential as WebAuthnCredential,
          ),
        };
      },
    );
  }
}
