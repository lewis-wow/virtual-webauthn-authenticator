import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { KeyAlgorithm } from '@repo/enums';
import { COSEKey } from '@repo/keys';
import { uuidToBuffer } from '@repo/utils';
import {
  PublicKeyCredentialRequestOptionsSchema,
  PublicKeyCredentialSchema,
} from '@repo/validation';
import { describeRoute, resolver, validator as zValidator } from 'hono-openapi';

export const credentialsGetHandlers = factory.createHandlers(
  describeRoute({
    description:
      'Corresponds to navigator.credentials.get(), used for generating an assertion to authenticate a user as part of the WebAuthn authentication ceremony.',
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
  zValidator('query', PublicKeyCredentialRequestOptionsSchema),
  protectedMiddleware,
  async (ctx) => {
    const publicKeyCredentialRequestOptions = ctx.req.valid('query');

    const webAuthnCredential =
      await ctx.var.webAuthnCredentialRepository.findFirstMatchingCredentialAndIncrementCounterAtomically(
        {
          publicKeyCredentialRequestOptions,
          user: ctx.var.user,
        },
      );

    const {
      jwk,
      meta: { keyVaultKey },
    } = await ctx.var.keyVault.getKey({
      keyName: webAuthnCredential.keyVaultKeyName,
    });

    const COSEPublicKey = COSEKey.fromJwk(jwk);

    const credentialSigner =
      ctx.var.credentialSignerFactory.createCredentialSigner({
        algorithm: KeyAlgorithm.ES256,
        keyVaultKey,
      });

    const publicKeyCredential =
      await ctx.var.virtualAuthenticator.getCredential({
        publicKeyCredentialRequestOptions,
        COSEPublicKey,
        credentialSigner,
        meta: {
          counter: webAuthnCredential.counter,
          credentialID: uuidToBuffer(webAuthnCredential.id),
        },
      });

    return ctx.json(PublicKeyCredentialSchema.encode(publicKeyCredential));
  },
);
