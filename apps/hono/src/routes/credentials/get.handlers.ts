import { factory } from '@/factory';
import { credentialSignerFactory } from '@/lib/credentialSignerFactory';
import { keyVault } from '@/lib/keyVault';
import { virtualAuthenticator } from '@/lib/virtualAuthenticator';
import { webAuthnCredentialRepository } from '@/lib/webAuthnCredentialRepository';
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
    summary: 'Authenticate with a credential',
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
      await webAuthnCredentialRepository.findFirstMatchingCredentialAndIncrementCounterAtomically(
        publicKeyCredentialRequestOptions,
        ctx.var.user,
      );

    const {
      jwk,
      meta: { keyVaultKey },
    } = await keyVault.getKey(webAuthnCredential);

    const COSEPublicKey = COSEKey.fromJwk(jwk);

    const credentialSigner = credentialSignerFactory.createCredentialSigner({
      algorithm: KeyAlgorithm.ES256,
      keyVaultKey,
    });

    const publicKeyCredential = await virtualAuthenticator.getCredential(
      publicKeyCredentialRequestOptions,
      COSEPublicKey,
      credentialSigner,
      {
        counter: webAuthnCredential.counter,
        credentialID: uuidToBuffer(webAuthnCredential.id),
      },
    );

    return ctx.json(PublicKeyCredentialSchema.encode(publicKeyCredential));
  },
);
