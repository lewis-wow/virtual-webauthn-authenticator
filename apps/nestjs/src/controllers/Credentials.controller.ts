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
import { Jwt } from '@repo/crypto';
import { Forbidden } from '@repo/exception/http';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import type { Uint8Array_ } from '@repo/types';
import { VirtualAuthenticatorAgent } from '@repo/virtual-authenticator';
import { VirtualAuthenticatorAgentCredentialSelectInterruption } from '@repo/virtual-authenticator/interruption';
import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';
import { match, P } from 'ts-pattern';

import { Jwt as JwtDecorator } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';

@Controller()
@UseFilters(ExceptionFilter)
export class CredentialsController {
  constructor(
    private readonly virtualAuthenticatorAgent: VirtualAuthenticatorAgent,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
    private readonly jwt: Jwt,
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
        const { publicKeyCredentialCreationOptions, meta } = body;

        if (!permissions.includes(Permission['CREDENTIAL.CREATE'])) {
          throw new Forbidden();
        }

        const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
          id: UUIDMapper.UUIDtoBytes(userId),
          name: name,
          displayName:
            publicKeyCredentialCreationOptions.user?.displayName ?? name,
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
              apiKeyId,

              userPresenceEnabled: true,
              userVerificationEnabled: true,
            },
            context: undefined,
          });

        await this._auditCredentialAction({
          action: LogAction.CREATE,
          publicKeyCredentialRawId: publicKeyCredential.rawId,
          jwtPayload,
        });

        return {
          status: HttpStatusCode.OK,
          body: CreateCredentialResponseSchema[HttpStatusCode.OK].encode(
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
        const { publicKeyCredentialRequestOptions, meta } = body;
        const { userId, apiKeyId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['CREDENTIAL.GET'])) {
          throw new Forbidden();
        }

        this.logger.debug('Getting credential', {
          userId: userId,
        });

        try {
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

                userPresenceEnabled: true,
                userVerificationEnabled: true,
              },
              context: undefined,
            });

          await this._auditCredentialAction({
            action: LogAction.GET,
            publicKeyCredentialRawId: publicKeyCredential.rawId,
            jwtPayload,
          });

          return {
            status: HttpStatusCode.OK,
            body: GetCredentialResponseSchema[HttpStatusCode.OK].encode(
              publicKeyCredential,
            ),
          };
        } catch (error) {
          return await match(error)
            .with(
              P.instanceOf(
                VirtualAuthenticatorAgentCredentialSelectInterruption,
              ),
              async (interaction) => {
                return {
                  status: HttpStatusCode.PRECONDITION_REQUIRED,
                  body: GetCredentialResponseSchema[
                    HttpStatusCode.PRECONDITION_REQUIRED
                  ].encode({
                    ...interaction.payload,
                    optionsHash: await this.jwt.sign({
                      optionsHash: interaction.payload.optionsHash,
                    }),
                  }),
                };
              },
            )
            .otherwise(() => {
              // Rethrow original error.
              throw error;
            });
        }
      },
    );
  }
}
