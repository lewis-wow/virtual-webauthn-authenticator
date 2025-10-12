import { Elysia } from 'elysia';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { createSign, generateKeyPairSync } from 'node:crypto';
import type { ICredentialSigner, ICredentialPublicKey } from '@repo/types';
import {
  PublicKeyCredentialAuthenticatorAssertionResponseSchema,
  PublicKeyCredentialAuthenticatorAttestationResponseSchema,
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialRequestOptionsSchema,
} from '@repo/validation';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

const credentialPublicKey: ICredentialPublicKey = {
  getJwk: () => {
    return keyPair.publicKey.export({ format: 'jwk' });
  },
};

const credentialSigner: ICredentialSigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};

const authenticator = new VirtualAuthenticator({
  credentialPublicKey,
  credentialSigner,
});

export const credentials = new Elysia({ prefix: '/credentials' })
  .post(
    '/',
    async ({ body }) => {
      const credentials = await authenticator.createCredential(body);

      return PublicKeyCredentialAuthenticatorAttestationResponseSchema.encode(
        credentials,
      );
    },
    {
      body: PublicKeyCredentialCreationOptionsSchema,
    },
  )
  .get(
    '/',
    async ({ params }) => {
      const credentials = await authenticator.getCredential(params as any);

      return PublicKeyCredentialAuthenticatorAssertionResponseSchema.encode(
        credentials,
      );
    },
    {
      params: PublicKeyCredentialRequestOptionsSchema,
    },
  );
