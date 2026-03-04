import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission, TokenType } from '@repo/auth/enums';
import type { JwtPayload } from '@repo/auth/zod-validation';
import {
  CreateVirtualAuthenticatorResponseSchema,
  DeleteVirtualAuthenticatorResponseSchema,
  ListVirtualAuthenticatorsResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { Forbidden } from '@repo/exception/http';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { Prisma } from '@repo/prisma';
import { PrismaErrorCode } from '@repo/prisma/enums';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { VirtualAuthenticatorNotFound } from '../exceptions/VirtualAuthenticatorNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(ExceptionFilter)
export class VirtualAuthenticatorsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly activityLog: ActivityLog,
  ) {}

  @TsRestHandler(nestjsContract.api.virtualAuthenticators.create)
  @UseGuards(AuthenticatedGuard)
  async createVirtualAuthenticator(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.virtualAuthenticators.create,
      async ({ body }) => {
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['VIRTUAL_AUTHENTICATOR.CREATE'])) {
          throw new Forbidden();
        }

        const virtualAuthenticator =
          await this.prisma.virtualAuthenticator.create({
            data: {
              userId,
              userVerificationType: body.userVerificationType,
              pin: body.pin ?? null,
            },
          });

        this.logger.debug('Created VirtualAuthenticator.', {
          virtualAuthenticator,
          userId,
        });

        await this.activityLog.audit({
          action: LogAction.CREATE,
          entity: LogEntity.VIRTUAL_AUTHENTICATOR,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: CreateVirtualAuthenticatorResponseSchema[
            HttpStatusCode.OK_200
          ].encode(virtualAuthenticator),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.virtualAuthenticators.list)
  @UseGuards(AuthenticatedGuard)
  async listVirtualAuthenticators(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.virtualAuthenticators.list,
      async ({ query }) => {
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['VIRTUAL_AUTHENTICATOR.READ'])) {
          throw new Forbidden();
        }

        const pagination = new Pagination(async ({ pagination }) => {
          return this.prisma.virtualAuthenticator.findMany({
            where: {
              userId,
            },
            ...pagination,
          });
        });

        const result = await pagination.fetch({
          limit: query?.limit,
          cursor: query?.cursor,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: ListVirtualAuthenticatorsResponseSchema[
            HttpStatusCode.OK_200
          ].encode(result),
        };
      },
    );
  }

  @TsRestHandler(nestjsContract.api.virtualAuthenticators.delete)
  @UseGuards(AuthenticatedGuard)
  async deleteVirtualAuthenticator(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.virtualAuthenticators.delete,
      async ({ params }) => {
        const { userId, permissions } = jwtPayload;

        if (!permissions.includes(Permission['VIRTUAL_AUTHENTICATOR.DELETE'])) {
          throw new Forbidden();
        }

        let virtualAuthenticator;
        try {
          virtualAuthenticator = await this.prisma.virtualAuthenticator.delete({
            where: {
              id: params.id,
              userId,
            },
          });
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === PrismaErrorCode.RECORDS_NOT_FOUND) {
              throw new VirtualAuthenticatorNotFound();
            }
          }

          throw error;
        }

        this.logger.debug('Deleted VirtualAuthenticator.', {
          virtualAuthenticator,
          userId,
        });

        await this.activityLog.audit({
          action: LogAction.DELETE,
          entity: LogEntity.VIRTUAL_AUTHENTICATOR,

          apiKeyId:
            jwtPayload.tokenType === TokenType.API_KEY
              ? jwtPayload.apiKeyId
              : undefined,
          userId: jwtPayload.userId,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: DeleteVirtualAuthenticatorResponseSchema[
            HttpStatusCode.OK_200
          ].encode(virtualAuthenticator),
        };
      },
    );
  }
}
