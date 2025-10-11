import { Elysia } from 'elysia';
import { VirtualAuthenticator } from '@repo/virtual-authenticator';
import { createSign, generateKeyPairSync } from 'node:crypto';
import type { IPublicJsonWebKeyFactory, ISigner } from '@repo/types';
import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialSchema,
} from '@repo/validation';

const keyPair = generateKeyPairSync('ec', {
  namedCurve: 'P-256',
});

const publicJsonWebKeyFactory: IPublicJsonWebKeyFactory = {
  getPublicJsonWebKey: () => {
    return keyPair.publicKey.export({ format: 'jwk' });
  },
};

const signer: ISigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};

const authenticator = new VirtualAuthenticator({
  publicJsonWebKeyFactory,
  signer,
});

export const credentials = new Elysia({ prefix: '/credentials' })
  .post(
    '/',
    async ({ body }) => {
      const credentials = await authenticator.createCredential(body);

      return PublicKeyCredentialSchema.encode(credentials);
    },
    {
      body: PublicKeyCredentialCreationOptionsSchema,
    },
  )
  .get(
    '/',
    async ({ params }) => {
      const credentials = await authenticator.getCredential(params as any);

      return PublicKeyCredentialSchema.encode(credentials);
    },
    {},
  );
