import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/validation';
import { nestjsContract } from '@repo/contract/nestjs';
import {
  CreateCredentialResponseSchema,
  GetCredentialResponseSchema,
} from '@repo/contract/validation';
import { UUIDMapper } from '@repo/core/mappers';
import { EventLog } from '@repo/event-log';
import { EventLogAction, EventLogEntity } from '@repo/event-log/enums';
import { Forbidden } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { Schema } from 'effect';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';

@Controller()
@UseFilters(new ExceptionFilter())
export class CredentialsController {
  constructor(
    private readonly virtualAuthenticator: VirtualAuthenticator,
    private readonly logger: Logger,
    private readonly eventLog: EventLog,
  ) {}

  @TsRestHandler(nestjsContract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.create,
      async ({ body }) => {
        const { userId, apiKeyId, permissions, name } = jwtPayload;
        const { publicKeyCredentialCreationOptions, meta } = body;

        if (
          !permissions.includes(Permission['Credential.create']) ||
          !permissions.includes(Permission['WebAuthnCredential.create'])
        ) {
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
          await this.virtualAuthenticator.createCredential({
            publicKeyCredentialCreationOptions:
              publicKeyCredentialCreationOptionsWithUser,
            meta: {
              origin: meta.origin,
              userId: userId,
            },
            context: {
              apiKeyId: apiKeyId,
            },
          });

        await this.eventLog.log({
          action: EventLogAction.CREATE,
          entity: EventLogEntity.CREDENTIAL,
          entityId: UUIDMapper.bytesToUUID(publicKeyCredential.rawId),

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: Schema.encodeSync(CreateCredentialResponseSchema)(
            publicKeyCredential,
          ),
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

        if (
          !permissions.includes(Permission['Credential.get']) ||
          !permissions.includes(Permission['WebAuthnCredential.read'])
        ) {
          throw new Forbidden();
        }

        this.logger.debug('Getting credential', {
          userId: userId,
        });

        const publicKeyCredential =
          await this.virtualAuthenticator.getCredential({
            publicKeyCredentialRequestOptions,
            meta: {
              origin: meta.origin,
              userId: userId,
            },
            context: { apiKeyId },
          });

        await this.eventLog.log({
          action: EventLogAction.GET,
          entity: EventLogEntity.CREDENTIAL,
          entityId: UUIDMapper.bytesToUUID(publicKeyCredential.rawId),

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: 200,
          body: Schema.encodeSync(GetCredentialResponseSchema)(
            publicKeyCredential,
          ),
        };
      },
    );
  }
}
