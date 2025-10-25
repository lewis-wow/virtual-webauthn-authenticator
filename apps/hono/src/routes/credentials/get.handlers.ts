import { factory } from '@/factory';
import { protectedMiddleware } from '@/middlewares/protectedMiddleware';
import { sValidator } from '@hono/standard-validator';
import { KeyAlgorithm } from '@repo/enums';
import { COSEKey } from '@repo/keys';
import { uuidToBuffer } from '@repo/utils';
import {
  GetCredentialRequestQuerySchema,
  GetCredentialResponseSchema,
} from '@repo/validation';

export const credentialsGetHandlers = factory.createHandlers(
  sValidator('query', GetCredentialRequestQuerySchema),
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

    return ctx.json(GetCredentialResponseSchema.encode(publicKeyCredential));
  },
);
