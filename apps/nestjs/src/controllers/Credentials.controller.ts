import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { Ability } from '@repo/auth/abilities';
import { Permission, PermissionEntity, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/validation';
import { contract } from '@repo/contract';
import {
  CreateCredentialResponseSchema,
  GetCredentialResponseSchema,
} from '@repo/contract/validation';
import { UUIDMapper } from '@repo/core/mappers';
import { EventLog } from '@repo/event-log';
import { Forbidden, Unauthorized } from '@repo/exception/http';
import { Logger } from '@repo/logger';
import { EventAction } from '@repo/prisma';
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
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new ExceptionFilter())
export class CredentialsController {
  constructor(
    private readonly virtualAuthenticator: VirtualAuthenticator,
    private readonly prisma: PrismaService,

    private readonly logger: Logger,
    private readonly eventLog: EventLog,
  ) {}

  @TsRestHandler(contract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.create, async ({ body }) => {
      const ability = Ability.forJwt(jwtPayload);

      if (
        ability.cannot('create', PermissionEntity.Credential) ||
        ability.cannot('create', PermissionEntity.WebAuthnCredential)
      ) {
        throw new Forbidden();
      }

      const { userId, name } = jwtPayload;
      const { publicKeyCredentialCreationOptions, meta } = body;

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
        });

      await this.eventLog.log({
        action: EventAction.CREATE,
        entity: 'WebAuthnCredential',
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
    });
  }

  @TsRestHandler(contract.api.credentials.get)
  @UseGuards(AuthenticatedGuard)
  async getCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.get, async ({ body }) => {
      const { publicKeyCredentialRequestOptions, meta } = body;
      const { userId } = jwtPayload;

      const ability = Ability.forJwt(jwtPayload);
      const webAuthnCredential =
        await this.prisma.webAuthnCredential.findFirstOrThrow({
          where:
            VirtualAuthenticator.createFindFirstMatchingCredentialWhereInput({
              publicKeyCredentialRequestOptions,
              userId,
            }),
          select: {
            apiKeyId: true,
          },
        });

      if (
        ability.cannot('get', PermissionEntity.Credential) ||
        ability.cannot(
          'read',
          PermissionEntity.WebAuthnCredential,
          webAuthnCredential,
        )
      ) {
        throw new Forbidden();
      }

      if (jwtPayload.tokenType === TokenType.API_KEY) {
        const where =
          VirtualAuthenticator.createFindFirstMatchingCredentialWhereInput({
            publicKeyCredentialRequestOptions,
            userId,
          });

        const webAuthnCredential =
          await this.prisma.webAuthnCredential.findFirstOrThrow({
            where: {
              ...where,
            },
          });

        const apiKeyCretedThisWebAuthnCredential =
          await this.eventLog.hasOccurred({
            action: EventAction.CREATE,
            apiKeyId: jwtPayload.apiKeyId,
            entity: 'WebAuthnCredential',
            entityId: webAuthnCredential.id,
          });

        if (!apiKeyCretedThisWebAuthnCredential) {
          throw new Forbidden();
        }
      }

      this.logger.debug('Getting credential', {
        userId: userId,
      });

      const publicKeyCredential = await this.virtualAuthenticator.getCredential(
        {
          publicKeyCredentialRequestOptions,
          meta: {
            origin: meta.origin,
            userId: userId,
          },
        },
      );

      await this.eventLog.log({
        action: EventAction.READ,
        apiKeyId:
          jwtPayload.tokenType === TokenType.API_KEY
            ? jwtPayload.apiKeyId
            : undefined,
        userId: jwtPayload.userId,
        entity: 'WebAuthnCredential',
        entityId: UUIDMapper.bytesToUUID(publicKeyCredential.rawId),
      });

      return {
        status: 200,
        body: Schema.encodeSync(GetCredentialResponseSchema)(
          publicKeyCredential,
        ),
      };
    });
  }
}
