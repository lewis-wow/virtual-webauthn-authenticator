import { factory } from '@/factory';
import { keyVault } from '@/lib/keyVault';
import { prisma } from '@/lib/prisma';
import { virtualAuthenticator } from '@/lib/virtualAuthenticator';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { COSEKey } from '@repo/keys';
import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsPostHandlers = factory.createHandlers(
  describeRoute({
    summary: 'Register a new credential',
    description:
      'Corresponds to navigator.credentials.create(), used for creating a new public key credential as part of the WebAuthn registration ceremony.',
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: resolver(PublicKeyCredentialSchema),
          },
        },
      },
    },
  }),
  zValidator('json', PublicKeyCredentialCreationOptionsSchema),
  protectedMiddleware,
  async (ctx) => {
    const publicKeyCredentialCreationOptions = ctx.req.valid('json');

    const {
      jwk,
      meta: { keyVaultKey },
    } = await keyVault.createKey(
      publicKeyCredentialCreationOptions,
      ctx.var.user,
    );

    const COSEPublicKey = COSEKey.fromJwk(jwk);

    const publicKeyCredential = await virtualAuthenticator.createCredential(
      publicKeyCredentialCreationOptions,
      COSEPublicKey,
    );

    await prisma.webAuthnCredential.create({
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

    return ctx.json(PublicKeyCredentialSchema.encode(publicKeyCredential));
  },
);
