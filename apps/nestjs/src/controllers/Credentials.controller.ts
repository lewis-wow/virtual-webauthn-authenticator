import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyAlgorithm } from '@repo/enums';
import { CredentialSignerFactory, KeyVault } from '@repo/key-vault';
import { COSEKey } from '@repo/keys';
import { Logger } from '@repo/logger';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { uuidToBuffer } from '@repo/utils';
import {
  type JwtPayload,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/validation';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { User } from '../decorators/User.decorator';
import { HTTPExceptionFilter } from '../filters/HTTPException.filter';
import { PrismaExceptionsFilter } from '../filters/PrismaExceptions.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';

@Controller()
@UseFilters(new HTTPExceptionFilter(), new PrismaExceptionsFilter())
export class CredentialsController {
  constructor(
    private readonly keyVault: KeyVault,
    private readonly virtualAuthenticator: VirtualAuthenticator,
    private readonly credentialSignerFactory: CredentialSignerFactory,
    private readonly logger: Logger,
  ) {}

  @TsRestHandler(contract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@User() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.create, async ({ body }) => {
      const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
        id: uuidToBuffer(jwtPayload.id),
        name: jwtPayload.name,
        displayName: jwtPayload.name,
      };

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
        {
          ...body,
          user: publicKeyCredentialUserEntity,
        };

      const {
        jwk,
        meta: { keyVaultKey },
      } = await this.keyVault.createKey({
        publicKeyCredentialCreationOptions,
        user: jwtPayload,
      });

      const COSEPublicKey = COSEKey.fromJwk(jwk);

      this.logger.debug('Creating credential', {
        userId: jwtPayload.id,
      });

      const publicKeyCredential =
        await this.virtualAuthenticator.createCredential({
          publicKeyCredentialCreationOptions,
          COSEPublicKey,
          meta: {
            webAuthnCredentialKeyMetaType:
              WebAuthnCredentialKeyMetaType.KEY_VAULT,
            webAuthnCredentialKeyVaultKeyMeta: {
              keyVaultKeyId: keyVaultKey.id,
              keyVaultKeyName: keyVaultKey.name,
              hsm: false,
            },
          },
        });

      return {
        status: 200,
        body: contract.api.credentials.create.responses[200].encode(
          publicKeyCredential,
        ),
      };
    });
  }

  @TsRestHandler(contract.api.credentials.get)
  @UseGuards(AuthenticatedGuard)
  async getCredential(@User() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.get, async ({ query }) => {
      this.logger.debug('Getting credential', {
        userId: jwtPayload.id,
      });

      const publicKeyCredential = await this.virtualAuthenticator.getCredential(
        {
          publicKeyCredentialRequestOptions: query,
          credentialSignerFactory: async (webAuthnCredential) => {
            if (
              webAuthnCredential.webAuthnCredentialKeyMetaType !==
              WebAuthnCredentialKeyMetaType.KEY_VAULT
            ) {
              throw new Error('Unexpected WebAuthnCredentialKeyMetaType.');
            }

            const {
              meta: { keyVaultKey },
            } = await this.keyVault.getKey({
              keyName:
                webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta!
                  .keyVaultKeyName,
            });

            const credentialSigner =
              this.credentialSignerFactory.createCredentialSigner({
                algorithm: KeyAlgorithm.ES256,
                keyVaultKey,
              });

            return credentialSigner;
          },
          meta: {
            user: jwtPayload,
          },
        },
      );

      return {
        status: 200,
        body: contract.api.credentials.get.responses[200].encode(
          publicKeyCredential,
        ),
      };
    });
  }
}
