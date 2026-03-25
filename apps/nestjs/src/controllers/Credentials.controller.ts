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
import { Jwks, Jwt } from '@repo/crypto';
import { Forbidden } from '@repo/exception/http';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import type { Uint8Array_ } from '@repo/types';
import { VirtualAuthenticatorAgent } from '@repo/virtual-authenticator-agent';
import { UserNotExists } from '@repo/virtual-authenticator/exceptions';
import type { PublicKeyCredentialCreationOptions } from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt as JwtDecorator } from '../decorators/Jwt.decorator';
import { NoActiveVirtualAuthenticator } from '../exceptions/NoActiveVirtualAuthenticator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(ExceptionFilter)
export class CredentialsController {
  constructor(
    private readonly virtualAuthenticatorAgent: VirtualAuthenticatorAgent,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
    private readonly jwt: Jwt,
    private readonly jwks: Jwks,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Logs a credential audit event.
   * @param action - The action performed (CREATE or GET)
   * @param credentialRawId - The raw ID of the credential
   * @param jwtPayload - The JWT payload containing user and API key information
   */
  private async _auditCredentialAction(opts: {
    action: LogAction;
    publicKeyCredentialRawId: Uint8Array_;
    jwtPayload: JwtPayload;
  }): Promise<void> {
    const { action, publicKeyCredentialRawId, jwtPayload } = opts;

    await this.activityLog.audit({
      action,
      entity: LogEntity.CREDENTIAL,
      entityId: UUIDMapper.bytesToUUID(publicKeyCredentialRawId),
      apiKeyId:
        jwtPayload.tokenType === TokenType.API_KEY
          ? jwtPayload.apiKeyId
          : undefined,
      userId: jwtPayload.userId,
    });
  }

  @TsRestHandler(nestjsContract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.create,
      async ({ body }) => {
        const { userId, apiKeyId, permissions, name } = jwtPayload;
        const {
          publicKeyCredentialCreationOptions,
          meta,
          prevStateToken,
          nextState,
        } = body;

        if (!permissions.includes(Permission['CREDENTIAL.CREATE'])) {
          throw new Forbidden();
        }

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new UserNotExists();
        }

        const activeVirtualAuthenticator =
          await this.prisma.virtualAuthenticator.findFirst({
            where: { userId, isActive: true },
          });

        if (!activeVirtualAuthenticator) {
          throw new NoActiveVirtualAuthenticator();
        }

        const publicKeyCredentialCreationOptionsWithUser: PublicKeyCredentialCreationOptions =
          {
            ...publicKeyCredentialCreationOptions,
            user: {
              id: UUIDMapper.UUIDtoBytes(userId),
              name,
              displayName:
                publicKeyCredentialCreationOptions.user?.displayName ?? name,
            },
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
              apiKeyId,
              virtualAuthenticatorId: activeVirtualAuthenticator.id,

              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                activeVirtualAuthenticator.userVerificationType,
            },
            prevStateToken,
            nextState,
          });

        await this._auditCredentialAction({
          action: LogAction.CREATE,
          publicKeyCredentialRawId: publicKeyCredential.rawId,
          jwtPayload,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: CreateCredentialResponseSchema[HttpStatusCode.OK_200].encode(
            publicKeyCredential,
          ),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.credentials.get)
  @UseGuards(AuthenticatedGuard)
  async getCredential(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.get,
      async ({ body }) => {
        const {
          publicKeyCredentialRequestOptions,
          meta,
          prevStateToken,
          nextState,
        } = body;
        const { userId, apiKeyId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['CREDENTIAL.GET'])) {
          throw new Forbidden();
        }

        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new UserNotExists();
        }

        const activeVirtualAuthenticator =
          await this.prisma.virtualAuthenticator.findFirst({
            where: { userId, isActive: true },
          });

        if (!activeVirtualAuthenticator) {
          throw new NoActiveVirtualAuthenticator();
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
              apiKeyId,
              virtualAuthenticatorId: activeVirtualAuthenticator.id,

              userPresenceEnabled: true,
              userVerificationEnabled: true,
              userVerificationType:
                activeVirtualAuthenticator.userVerificationType,
            },
            prevStateToken,
            nextState,
          });

        await this._auditCredentialAction({
          action: LogAction.GET,
          publicKeyCredentialRawId: publicKeyCredential.rawId,
          jwtPayload,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: GetCredentialResponseSchema[HttpStatusCode.OK_200].encode(
            publicKeyCredential,
          ),
        };
      },
    );
  }
}
