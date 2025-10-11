import { Elysia } from 'elysia';
import {
  VirtualAuthenticator,
  type IPublicJsonWebKeyFactory,
  type ISigner,
} from '@repo/virtual-authenticator';
import { createSign, generateKeyPairSync } from 'node:crypto';
import {
  PublicKeyCredentialCreationOptionsSchema,
  PublicKeyCredentialSchema,
} from '../validation/index.js';

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

const credentials = new Elysia({ prefix: '/credentials' })
  .post(
    '/',
    async ({ body }) => {
      const credentials = await authenticator.createCredential(body);

      return credentials;
    },
    {
      body: PublicKeyCredentialCreationOptionsSchema,
      response: PublicKeyCredentialSchema,
    },
  )
  .get('/', (ctx) => {});
