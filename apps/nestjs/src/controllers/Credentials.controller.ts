import { Controller, UseFilters, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyAlgorithm } from '@repo/enums';
import {
  CredentialSignerFactory,
  KeyVault,
  WebAuthnCredentialRepository,
} from '@repo/key-vault';
import { COSEKey } from '@repo/keys';
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
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
@UseFilters(new HTTPExceptionFilter())
export class CredentialsController {
  constructor(
    private readonly keyVault: KeyVault,
    private readonly prisma: PrismaService,
    private readonly virtualAuthenticator: VirtualAuthenticator,
    private readonly webAuthnCredentialRepository: WebAuthnCredentialRepository,
    private readonly credentialSignerFactory: CredentialSignerFactory,
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

      const webAuthnCredential = await this.prisma.webAuthnCredential.create({
        data: {
          aaguid: VirtualAuthenticator.AAGUID.toString('base64url'),
          COSEPublicKey: COSEPublicKey.toBuffer(),
          keyVaultKeyId: keyVaultKey.id!,
          keyVaultKeyName: keyVaultKey.name,
          rpId: publicKeyCredentialCreationOptions.rp.id,
          userId: jwtPayload.id,
          userHandle: null,
        },
      });

      const publicKeyCredential =
        await this.virtualAuthenticator.createCredential({
          publicKeyCredentialCreationOptions,
          COSEPublicKey,
          meta: {
            credentialID: uuidToBuffer(webAuthnCredential.id),
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
      const webAuthnCredential =
        await this.webAuthnCredentialRepository.findFirstMatchingCredentialAndIncrementCounterAtomically(
          {
            publicKeyCredentialRequestOptions: query,
            user: jwtPayload,
          },
        );

      const {
        jwk,
        meta: { keyVaultKey },
      } = await this.keyVault.getKey({
        keyName: webAuthnCredential.keyVaultKeyName,
      });

      const COSEPublicKey = COSEKey.fromJwk(jwk);

      const credentialSigner =
        this.credentialSignerFactory.createCredentialSigner({
          algorithm: KeyAlgorithm.ES256,
          keyVaultKey,
        });

      const publicKeyCredential = await this.virtualAuthenticator.getCredential(
        {
          publicKeyCredentialRequestOptions: query,
          COSEPublicKey,
          credentialSigner,
          meta: {
            counter: webAuthnCredential.counter,
            credentialID: uuidToBuffer(webAuthnCredential.id),
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
