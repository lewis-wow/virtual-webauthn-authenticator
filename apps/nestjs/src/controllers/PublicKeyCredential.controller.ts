import { KeyClient } from '@azure/keyvault-keys';
import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission } from '@repo/auth/enums';
import {
  CreatePublicKeyAssertionResponseSchema,
  CreatePublicKeyCredentialResponseSchema,
  DeletePublicKeyCredentialResponseSchema,
  GetPublicKeyCredentialResponseSchema,
  ListPublicKeyCredentialsResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { Jwks, Jwt } from '@repo/jwt';
import { HttpStatusCode } from '@repo/http';
import type { JwtPayload } from '@repo/jwt/validation';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { WebAuthnPublicKeyCredentialKeyMetaType } from '@repo/prisma';
import type { Uint8Array_ } from '@repo/types';
import { bytesToUuid, uuidToBytes } from '@repo/utils';
import { VirtualAuthenticatorAgent } from '@repo/virtual-authenticator-agent';
import { UserNotExists } from '@repo/virtual-authenticator/exceptions';
import { WebAuthnPublicKeyCredentialWithMeta } from '@repo/virtual-authenticator/types';
import type {
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/virtual-authenticator/validation';
import { WebAuthnPublicKeyCredential } from '@repo/virtual-authenticator/validation';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt as JwtDecorator } from '../decorators/Jwt.decorator';
import { NoActiveVirtualAuthenticator } from '../exceptions/NoActiveVirtualAuthenticator';
import { WebAuthnPublicKeyCredentialNotFound } from '../exceptions/WebAuthnPublicKeyCredentialNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';
import { auditLog } from '../utils/AuditLog';
import { requirePermission } from '../utils/PermissionCheck';
import { handlePrismaNotFoundError } from '../utils/PrismaErrorHandler';

@Controller()
@UseFilters(ExceptionFilter)
export class PublicKeyCredentialController {
  constructor(
    private readonly virtualAuthenticatorAgent: VirtualAuthenticatorAgent,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
    private readonly jwt: Jwt,
    private readonly jwks: Jwks,
    private readonly prisma: PrismaService,
    private readonly keyClient: KeyClient,
  ) {}

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Validates that a user exists and has an active virtual authenticator.
   * @param userId - The ID of the user to validate
   * @returns The active virtual authenticator for the user
   * @throws UserNotExists if the user doesn't exist
   * @throws NoActiveVirtualAuthenticator if no active authenticator exists for the user
   */
  private async _validateUserAndGetActiveAuthenticator(
    userId: string,
  ): Promise<any> {
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

    return activeVirtualAuthenticator;
  }

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

    await auditLog({
      activityLog: this.activityLog,
      action,
      entity: LogEntity.CREDENTIAL,
      jwtPayload,
      entityId: bytesToUuid(publicKeyCredentialRawId),
    });
  }

  // ===========================================================================
  // Create (POST /public-key-credentials)
  // ===========================================================================

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

        requirePermission(permissions, Permission['CREDENTIAL.CREATE']);

        const activeVirtualAuthenticator =
          await this._validateUserAndGetActiveAuthenticator(userId);

        const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
          id: uuidToBytes(userId),
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
          body: CreatePublicKeyCredentialResponseSchema[
            HttpStatusCode.OK_200
          ].encode(publicKeyCredential),
        };
      },
    );
  }

  // ===========================================================================
  // Assertion (POST /assertions)
  // ===========================================================================

  @TsRestHandler(nestjsContract.api.credentials.assertion)
  @UseGuards(AuthenticatedGuard)
  async getCredential(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.assertion,
      async ({ body }) => {
        const {
          publicKeyCredentialRequestOptions,
          meta,
          prevStateToken,
          nextState,
        } = body;
        const { userId, apiKeyId, permissions } = jwtPayload;

        requirePermission(permissions, Permission['CREDENTIAL.GET']);

        const activeVirtualAuthenticator =
          await this._validateUserAndGetActiveAuthenticator(userId);

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
          body: CreatePublicKeyAssertionResponseSchema[
            HttpStatusCode.OK_200
          ].encode(publicKeyCredential),
        };
      },
    );
  }

  // ===========================================================================
  // List (GET /public-key-credentials)
  // ===========================================================================

  @TsRestHandler(nestjsContract.api.credentials.list)
  @UseGuards(AuthenticatedGuard)
  async listPublicKeyCredentials(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.list,
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
          body: ListPublicKeyCredentialsResponseSchema[
            HttpStatusCode.OK_200
          ].encode(result),
        };
      },
    );
  }

  // ===========================================================================
  // Get (GET /public-key-credentials/:id)
  // ===========================================================================

  @TsRestHandler(nestjsContract.api.credentials.get)
  @UseGuards(AuthenticatedGuard)
  async getPublicKeyCredential(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.get,
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
          body: GetPublicKeyCredentialResponseSchema[
            HttpStatusCode.OK_200
          ].encode(webAuthnPublicKeyCredential as WebAuthnPublicKeyCredential),
        };
      },
    );
  }

  // ===========================================================================
  // Delete (DELETE /public-key-credentials/:id)
  // ===========================================================================

  @TsRestHandler(nestjsContract.api.credentials.delete)
  @UseGuards(AuthenticatedGuard)
  async deletePublicKeyCredential(@JwtDecorator() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.credentials.delete,
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
          body: DeletePublicKeyCredentialResponseSchema[
            HttpStatusCode.OK_200
          ].encode(webAuthnPublicKeyCredential as WebAuthnPublicKeyCredential),
        };
      },
    );
  }
}
