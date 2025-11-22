import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@repo/auth/validation';
import { contract } from '@repo/contract';
import {
  CreateCredentialResponseSchema,
  GetCredentialResponseSchema,
} from '@repo/contract/validation';
import { UUIDMapper } from '@repo/core/mappers';
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
  ) {}

  @TsRestHandler(contract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.create, async ({ body }) => {
      const { user } = jwtPayload;
      const { publicKeyCredentialCreationOptions, meta } = body;

      const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
        id: UUIDMapper.UUIDtoBytes(user.id),
        name: user.name,
        displayName: user.name,
      };

      const publicKeyCredentialCreationOptionsWithUser: PublicKeyCredentialCreationOptions =
        {
          ...publicKeyCredentialCreationOptions,
          user: publicKeyCredentialUserEntity,
        };

      this.logger.debug('Creating credential', {
        userId: user.id,
      });

      const publicKeyCredential =
        await this.virtualAuthenticator.createCredential({
          publicKeyCredentialCreationOptions:
            publicKeyCredentialCreationOptionsWithUser,
          meta: {
            origin: meta.origin,
            userId: user.id,
          },
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
      const { user } = jwtPayload;
      const { publicKeyCredentialRequestOptions, meta } = body;

      this.logger.debug('Getting credential', {
        userId: user.id,
      });

      const publicKeyCredential = await this.virtualAuthenticator.getCredential(
        {
          publicKeyCredentialRequestOptions,
          meta: {
            origin: meta.origin,
            userId: user.id,
          },
        },
      );

      return {
        status: 200,
        body: Schema.encodeSync(GetCredentialResponseSchema)(
          publicKeyCredential,
        ),
      };
    });
  }
}
