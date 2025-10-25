import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import { COSEKey } from '@repo/keys';
import { uuidToBuffer } from '@repo/utils';
import {
  CreateCredentialRequestBodySchema,
  CreateCredentialResponseSchema,
  type PublicKeyCredentialCreationOptions,
  type PublicKeyCredentialUserEntity,
} from '@repo/validation';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';

export const credentialsPostHandlers = factory.createHandlers(
  sValidator('json', CreateCredentialRequestBodySchema),
  protectedMiddleware,
  async (ctx) => {
    const publicKeyCredentialCreationOptionsJson = ctx.req.valid('json');

    const publicKeyCredentialUserEntity: PublicKeyCredentialUserEntity = {
      id: uuidToBuffer(ctx.var.user.id),
      name: ctx.var.user.name,
      displayName: ctx.var.user.name,
    };

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions =
      {
        ...publicKeyCredentialCreationOptionsJson,
        user: publicKeyCredentialUserEntity,
      };

    const {
      jwk,
      meta: { keyVaultKey },
    } = await ctx.var.keyVault.createKey({
      publicKeyCredentialCreationOptions,
      user: ctx.var.user,
    });

    const COSEPublicKey = COSEKey.fromJwk(jwk);

    const publicKeyCredential =
      await ctx.var.virtualAuthenticator.createCredential({
        publicKeyCredentialCreationOptions,
        COSEPublicKey,
      });

    await ctx.var.prisma.webAuthnCredential.create({
      data: {
        id: publicKeyCredential.id,
        aaguid: VirtualAuthenticator.AAGUID.toString('base64url'),
        COSEPublicKey: COSEPublicKey.toBuffer(),
        keyVaultKeyId: keyVaultKey.id!,
        keyVaultKeyName: keyVaultKey.name,
        rpId: publicKeyCredentialCreationOptions.rp.id,
        userId: ctx.var.user.id,
        userHandle: null,
      },
    });

    return ctx.json(CreateCredentialResponseSchema.encode(publicKeyCredential));
  },
);
