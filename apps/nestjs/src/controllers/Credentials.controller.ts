import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/zod-validation';
import {
  CreateCredentialResponseSchema,
  GetCredentialResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { UUIDMapper } from '@repo/core/mappers';
import { Forbidden } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { VirtualAuthenticatorAgent } from '@repo/virtual-authenticator';
import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/virtual-authenticator/zod-validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';

@Controller()
@UseFilters(ExceptionFilter)
export class CredentialsController {
  constructor(
    private readonly virtualAuthenticatorAgent: VirtualAuthenticatorAgent,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
  ) {}

  @TsRestHandler(nestjsContract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.create,
      async ({ body }) => {
        const { userId, apiKeyId, permissions, name } = jwtPayload;
        const { publicKeyCredentialCreationOptions, meta } = body;

        if (!permissions.includes(Permission['Credential.create'])) {
          throw new Forbidden();
        }

        const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
          id: UUIDMapper.UUIDtoBytes(userId),
          name: name,
          displayName: name,
        };

        const publicKeyCredentialCreationOptionsWithUser: PublicKeyCredentialCreationOptions =
          {
            ...publicKeyCredentialCreationOptions,
            user: publicKeyCredentialUserEntity,
          };

        this.logger.debug('Creating credential', {
          userId: userId,
        });

        const publicKeyCredential =
          await this.virtualAuthenticatorAgent.createCredential({
            origin: meta.origin,
            options: {
              publicKey: publicKeyCredentialCreationOptionsWithUser,
              signal: undefined,
            },
            sameOriginWithAncestors: true,

            // Internal options
            meta: {
              origin: meta.origin,
              userId: userId,
            },
            context: {
              apiKeyId: apiKeyId,
            },
          });

        await this.activityLog.audit({
          action: LogAction.CREATE,
          entity: LogEntity.CREDENTIAL,
          entityId: UUIDMapper.bytesToUUID(publicKeyCredential.rawId),

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: CreateCredentialResponseSchema.encode(publicKeyCredential),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.credentials.get)
  @UseGuards(AuthenticatedGuard)
  async getCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.get,
      async ({ body }) => {
        const { publicKeyCredentialRequestOptions, meta } = body;
        const { userId, apiKeyId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['Credential.get'])) {
          throw new Forbidden();
        }

        this.logger.debug('Getting credential', {
          userId: userId,
        });

        const publicKeyCredential =
          await this.virtualAuthenticatorAgent.getAssertion({
            origin: meta.origin,
            options: {
              publicKey: publicKeyCredentialRequestOptions,
              signal: undefined,
            },
            sameOriginWithAncestors: true,

            // Internal options
            meta: {
              origin: meta.origin,
              userId: userId,
            },
            context: { apiKeyId },
          });

        await this.activityLog.audit({
          action: LogAction.GET,
          entity: LogEntity.CREDENTIAL,
          entityId: UUIDMapper.bytesToUUID(publicKeyCredential.rawId),

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: GetCredentialResponseSchema.encode(publicKeyCredential),
        };
      },
    );
  }
}
