/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { setDeep, WRONG_UUID } from '@repo/core/__tests__/helpers';
import {
  CHALLENGE_BASE64URL,
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { describe, test, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { JwtMiddleware } from '../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../src/services/Prisma.service';
import { JWT_CONFIG } from '../helpers/consts';
import { performPublicKeyCredentialRegistrationAndVerify } from '../helpers/performPublicKeyCredentialRegistrationAndVerify';
import { performPublicKeyCredentialRequestAndVerify } from '../helpers/performPublicKeyCredentialRequestAndVerify';
import { prisma } from '../helpers/prisma';

/**
 * Reusable request body for POST /api/credentials
 */
const PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD = {
  publicKeyCredentialCreationOptions: {
    challenge: CHALLENGE_BASE64URL,
    rp: {
      id: RP_ID,
      name: RP_ID,
    },
    pubKeyCredParams: [{ alg: COSEKeyAlgorithm.ES256, type: 'public-key' }],
  },
  meta: {
    origin: RP_ORIGIN,
  },
};

/**
 * Reusable base query for GET /api/credentials
 */
const PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD = {
  publicKeyCredentialRequestOptions: {
    challenge: CHALLENGE_BASE64URL,
    rpId: RP_ID,
  },
  meta: {
    origin: RP_ORIGIN,
  },
};

const jwtIssuer = new JwtIssuer({
  prisma,
  encryptionKey: 'secret',
  config: JWT_CONFIG,
});

describe('CredentialsController', () => {
  let app: INestApplication;
  let token: string;

  let registrationVerification: VerifiedRegistrationResponse;
  let base64CredentialID: string;

  beforeAll(async () => {
    token = await jwtIssuer.sign(USER_JWT_PAYLOAD);

    const appRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtAudience)
      .useValue(
        new MockJwtAudience({
          config: JWT_CONFIG,
          jwksFactory: async () => {
            return await jwtIssuer.jsonWebKeySet();
          },
        }),
      )
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = appRef.createNestApplication();

    const appModule = app.get(AppModule);
    appModule.configure = (consumer) => {
      consumer.apply(JwtMiddleware).forRoutes('/api');
    };

    await upsertTestingUser({ prisma });

    await app.init();

    const { response, verification } =
      await performPublicKeyCredentialRegistrationAndVerify({
        app: app.getHttpServer(),
        token,
        payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
        requireUserVerification: true,
        requireUserPresence: false,
      });

    // Save the results for use in other tests
    registrationVerification = verification;
    base64CredentialID = response.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  describe('POST /api/credentials/create', () => {
    test('With multiple supported `pubKeyCredParams`', async () => {
      const { webAuthnCredentialId } =
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload: setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams',
            (val) => [
              ...val,
              { alg: COSEKeyAlgorithm.ES512, type: 'public-key' },
            ],
          ),
        });

      await prisma.webAuthnCredential.delete({
        where: {
          id: webAuthnCredentialId,
        },
      });
    });

    test('With multiple unsupported and one supported `pubKeyCredParams`', async () => {
      const { webAuthnCredentialId } =
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload: setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams',
            (val) => [{ alg: -8, type: 'public-key' }, ...val],
          ),
        });

      await prisma.webAuthnCredential.delete({
        where: {
          id: webAuthnCredentialId,
        },
      });
    });

    test('With multiple unsupported `pubKeyCredParams`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams',
            () => [
              { alg: -8, type: 'public-key' },
              { alg: -9, type: 'public-key' },
            ],
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .send(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With short `challenge`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.challenge',
            () => randomBytes(10).toString('base64url'),
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With wrong `pubKeyCredParams.type`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams[0].type',
            () => 'wrong-type',
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With wrong symetric `pubKeyCredParams.alg`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams[0].alg',
            // 1 = AES-GCM mode w/ 128-bit key, 128-bit tag
            () => 1,
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With unsupported asymetric `pubKeyCredParams.alg`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            'publicKeyCredentialCreationOptions.pubKeyCredParams[0].alg',
            // -47 = ES256K	ECDSA using secp256k1 curve and SHA-256
            () => -47,
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /api/credentials/get', () => {
    test('As authenticated user', async () => {
      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        token,
        payload: {
          ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
          publicKeyCredentialRequestOptions: {
            ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD.publicKeyCredentialRequestOptions,
            allowCredentials: [
              {
                id: base64CredentialID,
                type: 'public-key',
              },
            ],
          },
        },
        registrationVerification,
        expectedNewCounter: 1,
      });
    });

    test('With empty `allowCredentials` as authenticated user', async () => {
      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        token,
        payload: {
          ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
          publicKeyCredentialRequestOptions: {
            ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD.publicKeyCredentialRequestOptions,
            allowCredentials: [],
          },
        },
        registrationVerification,
        expectedNewCounter: 2,
      });
    });

    test('With undefined `allowCredentials` as authenticated user', async () => {
      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        token,
        payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
        registrationVerification,
        expectedNewCounter: 3,
      });
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions.allowCredentials',
            () => [
              {
                id: base64CredentialID,
                type: 'public-key',
              },
            ],
          ),
        )
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With wrong token', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer WRONG_TOKEN`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions.allowCredentials',
            () => [
              {
                id: base64CredentialID,
                type: 'public-key',
              },
            ],
          ),
        )
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('`allowCredentials` that does not exists', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions.allowCredentials',
            () => [
              {
                id: WRONG_UUID,
                type: 'public-key',
              },
            ],
          ),
        )
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('`rpId` that does not exists', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions',
            (val) => ({
              ...val,
              rpId: 'WRONG_RP_ID',
              allowCredentials: [
                {
                  id: base64CredentialID,
                  type: 'public-key',
                },
              ],
            }),
          ),
        )
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('Short `challenge`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions',
            (val) => ({
              ...val,
              challenge: randomBytes(10).toString('base64url'),
              allowCredentials: [
                {
                  id: base64CredentialID,
                  type: 'public-key',
                },
              ],
            }),
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With undefined `rpId`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(
          setDeep(
            PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            'publicKeyCredentialRequestOptions',
            (val) => ({
              ...val,
              rpId: undefined,
              allowCredentials: [
                {
                  id: base64CredentialID,
                  type: 'public-key',
                },
              ],
            }),
          ),
        )
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
