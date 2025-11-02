import { Controller, Req, UseGuards } from '@nestjs/common';
import { contract } from '@repo/contract';
import { KeyVault } from '@repo/key-vault';
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
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { PrismaService } from '../services/Prisma.service';

@Controller()
export class CredentialsController {
  constructor(
    private readonly keyVault: KeyVault,
    private readonly prisma: PrismaService,
    private readonly virtualAuthenticator: VirtualAuthenticator,
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

      const publicKeyCredential =
        await this.virtualAuthenticator.createCredential({
          publicKeyCredentialCreationOptions,
          COSEPublicKey,
        });

      await this.prisma.webAuthnCredential.create({
        data: {
          id: publicKeyCredential.id,
          aaguid: VirtualAuthenticator.AAGUID.toString('base64url'),
          COSEPublicKey: COSEPublicKey.toBuffer(),
          keyVaultKeyId: keyVaultKey.id!,
          keyVaultKeyName: keyVaultKey.name,
          rpId: publicKeyCredentialCreationOptions.rp.id,
          userId: jwtPayload.id,
          userHandle: null,
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
}
