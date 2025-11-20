import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import type { JwtPayload } from '@repo/auth/validation';
import { contract } from '@repo/contract';
import {
  CreateCredentialResponseSchema,
  GetCredentialResponseSchema,
} from '@repo/contract/validation';
import { UUIDMapper } from '@repo/core/mappers';
import { CredentialSignerFactory, KeyVault } from '@repo/key-vault';
import { KeyAlgorithm } from '@repo/keys/enums';
import { COSEKeyAlgorithmMapper, COSEKeyMapper } from '@repo/keys/mappers';
import { Logger } from '@repo/logger';
import { WebAuthnCredentialKeyMetaType } from '@repo/prisma';
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
          generateKeyPair: async ({
            webAuthnCredentialId,
            pubKeyCredParams,
          }) => {
            const {
              jwk,
              meta: { keyVaultKey },
            } = await this.keyVault.createKey({
              keyName: webAuthnCredentialId,
              supportedPubKeyCredParam: pubKeyCredParams,
            });

            const COSEPublicKey = COSEKeyMapper.jwkToCOSEKey(jwk);

            return {
              COSEPublicKey: COSEKeyMapper.COSEKeyToBytes(COSEPublicKey),
              webAuthnCredentialKeyMetaType:
                WebAuthnCredentialKeyMetaType.KEY_VAULT,
              webAuthnCredentialKeyVaultKeyMeta: {
                keyVaultKeyId: keyVaultKey.id ?? null,
                keyVaultKeyName: keyVaultKey.name,
                hsm: false,
              },
            };
          },
          signatureFactory: async ({ data, webAuthnCredential }) => {
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
                webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta
                  .keyVaultKeyName,
            });

            const keyAlgorithm = KeyAlgorithm.ES256;

            const credentialSigner =
              this.credentialSignerFactory.createCredentialSigner({
                algorithm: keyAlgorithm,
                keyVaultKey,
              });

            const signature = await credentialSigner.sign(data);

            return {
              signature,
              alg: COSEKeyAlgorithmMapper.keyAlgorithmToCOSEKeyAlgorithm(
                keyAlgorithm,
              ),
            };
          },
          meta: {
            origin: meta.origin.toString(),
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
          signatureFactory: async ({ data, webAuthnCredential }) => {
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
                webAuthnCredential.webAuthnCredentialKeyVaultKeyMeta
                  .keyVaultKeyName,
            });

            const keyAlgorithm = KeyAlgorithm.ES256;

            const credentialSigner =
              this.credentialSignerFactory.createCredentialSigner({
                algorithm: keyAlgorithm,
                keyVaultKey,
              });

            const signature = await credentialSigner.sign(data);

            return {
              signature,
              alg: COSEKeyAlgorithmMapper.keyAlgorithmToCOSEKeyAlgorithm(
                keyAlgorithm,
              ),
            };
          },
          meta: {
            origin: meta.origin.toString(),
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
