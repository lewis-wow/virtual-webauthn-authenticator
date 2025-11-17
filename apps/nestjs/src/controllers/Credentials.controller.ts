import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyAlgorithm } from '@repo/enums';
import { CredentialSignerFactory, KeyVault } from '@repo/key-vault';
import { COSEKey } from '@repo/keys';
import { Logger } from '@repo/logger';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
import { uuidToBytes } from '@repo/utils';
import {
  type JwtPayload,
  PublicKeyCredentialCreationOptions,
  PublicKeyCredentialUserEntity,
} from '@repo/validation';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { tsRestHandler, TsRestHandler } from '@ts-rest/nest';

import { Jwt } from '../decorators/Jwt.decorator';
import { ExceptionFilter } from '../filters/Exception.filter';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';

@Controller()
@UseFilters(new ExceptionFilter())
export class CredentialsController {
  constructor(
    private readonly keyVault: KeyVault,
    private readonly virtualAuthenticator: VirtualAuthenticator,
    private readonly credentialSignerFactory: CredentialSignerFactory,
    private readonly logger: Logger,
  ) {}

  @TsRestHandler(contract.api.credentials.create)
  @UseGuards(AuthenticatedGuard)
  async createCredential(@Jwt() jwtPayload: JwtPayload) {
    return tsRestHandler(contract.api.credentials.create, async ({ body }) => {
      const { user } = jwtPayload;
      const { publicKeyCredentialCreationOptions, meta } = body;

      const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
        id: uuidToBytes(user.id),
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
          generateKeyPair: async ({ webAuthnCredentialId }) => {
            const {
              jwk,
              meta: { keyVaultKey },
            } = await this.keyVault.createKey({
              keyName: webAuthnCredentialId,
              supportedPubKeyCredParam:
                VirtualAuthenticator.findFirstSupportedPubKeyCredParams(
                  publicKeyCredentialCreationOptions.pubKeyCredParams,
                ),
            });

            const COSEPublicKey = COSEKey.fromJwk(jwk);

            return {
              COSEPublicKey: COSEPublicKey.toBuffer(),
              webAuthnCredentialKeyMetaType:
                WebAuthnCredentialKeyMetaType.KEY_VAULT,
              meta: {
                webAuthnCredentialKeyVaultKeyMeta: {
                  keyVaultKeyId: keyVaultKey.id,
                  keyVaultKeyName: keyVaultKey.name,
                  hsm: false,
                },
              },
            };
          },
          meta: {
            ...meta,
            user,
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
          signatureFactory: async ({ data, webAuthnCredential, meta }) => {
            if (
              webAuthnCredential.webAuthnCredentialKeyMetaType !==
              WebAuthnCredentialKeyMetaType.KEY_VAULT
            ) {
              throw new Error('Unexpected WebAuthnCredentialKeyMetaType.');
            }

            const {
              meta: { keyVaultKey },
            } = await this.keyVault.getKey({
              keyName: meta.webAuthnCredentialKeyVaultKeyMeta!.keyVaultKeyName,
            });

            const credentialSigner =
              this.credentialSignerFactory.createCredentialSigner({
                algorithm: KeyAlgorithm.ES256,
                keyVaultKey,
              });

            return await credentialSigner.sign(data);
          },
          meta: {
            ...meta,
            user,
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
