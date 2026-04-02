import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { ActivityLog } from '@repo/activity-log';
import { LogAction, LogEntity } from '@repo/activity-log/enums';
import { Permission } from '@repo/jwt/enums';
import type { JwtPayload } from '@repo/jwt/validation';
import {
  CreateVirtualAuthenticatorResponseSchema,
  DeleteVirtualAuthenticatorResponseSchema,
  ListVirtualAuthenticatorsResponseSchema,
  UpdateVirtualAuthenticatorResponseSchema,
} from '@repo/contract/dto';
import { nestjsContract } from '@repo/contract/nestjs';
import { HttpStatusCode } from '@repo/http';
import { Logger } from '@repo/logger';
import { Pagination } from '@repo/pagination';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { VirtualAuthenticatorNotFound } from '../exceptions/VirtualAuthenticatorNotFound';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';
import { auditLog } from '../utils/AuditLog';
import { requirePermission } from '../utils/PermissionCheck';
import { handlePrismaNotFoundError } from '../utils/PrismaErrorHandler';

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

        requirePermission(
          permissions,
          Permission['VIRTUAL_AUTHENTICATOR.CREATE'],
        );

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

        await auditLog({
          activityLog: this.activityLog,
          action: LogAction.CREATE,
          entity: LogEntity.VIRTUAL_AUTHENTICATOR,
          jwtPayload,
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

        requirePermission(
          permissions,
          Permission['VIRTUAL_AUTHENTICATOR.READ'],
        );

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

  @TsRestHandler(nestjsContract.api.virtualAuthenticators.update)
  @UseGuards(AuthenticatedGuard)
  async updateVirtualAuthenticator(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(
      nestjsContract.api.virtualAuthenticators.update,
      async ({ params, body }) => {
        const { userId, permissions } = jwtPayload;

        requirePermission(
          permissions,
          Permission['VIRTUAL_AUTHENTICATOR.WRITE'],
        );

        let virtualAuthenticator;
        try {
          virtualAuthenticator = await this.prisma.$transaction(async (tx) => {
            if (body.isActive === true) {
              // Deactivate all authenticators for this user
              await tx.virtualAuthenticator.updateMany({
                where: { userId },
                data: { isActive: false },
              });
            }

            return tx.virtualAuthenticator.update({
              where: {
                id: params.id,
                userId,
              },
              data: {
                ...(body.isActive !== undefined && {
                  isActive: body.isActive,
                }),
              },
            });
          });
        } catch (error) {
          handlePrismaNotFoundError({
            error,
            notFoundException: new VirtualAuthenticatorNotFound(),
          });
          throw error;
        }

        this.logger.debug('Updated VirtualAuthenticator.', {
          virtualAuthenticator,
          userId,
        });

        await auditLog({
          activityLog: this.activityLog,
          action: LogAction.UPDATE,
          entity: LogEntity.VIRTUAL_AUTHENTICATOR,
          jwtPayload,
        });

        return {
          status: HttpStatusCode.OK_200,
          body: UpdateVirtualAuthenticatorResponseSchema[
            HttpStatusCode.OK_200
          ].encode(virtualAuthenticator),
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

        requirePermission(
          permissions,
          Permission['VIRTUAL_AUTHENTICATOR.DELETE'],
        );

        let virtualAuthenticator;
        try {
          virtualAuthenticator = await this.prisma.virtualAuthenticator.delete({
            where: {
              id: params.id,
              userId,
            },
          });
        } catch (error) {
          handlePrismaNotFoundError({
            error,
            notFoundException: new VirtualAuthenticatorNotFound(),
          });
          throw error;
        }

        this.logger.debug('Deleted VirtualAuthenticator.', {
          virtualAuthenticator,
          userId,
        });

        await auditLog({
          activityLog: this.activityLog,
          action: LogAction.DELETE,
          entity: LogEntity.VIRTUAL_AUTHENTICATOR,
          jwtPayload,
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
