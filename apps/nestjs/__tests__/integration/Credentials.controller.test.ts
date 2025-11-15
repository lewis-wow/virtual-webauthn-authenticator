/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { MockJwtAudience } from '@repo/auth/__mocks__';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import { COSEKeyAlgorithm } from '@repo/enums';
import { COSEKey } from '@repo/keys';
import {
  CHALLENGE_BASE64URL,
  MOCK_PERSONAL_JWT_PAYLOAD,
  RP_ID,
  upsertTestingUser,
  WRONG_UUID,
} from '@repo/test-helpers';
import { bytesToUuid } from '@repo/utils';
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import request, { type Response } from 'supertest';
import { App } from 'supertest/types';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { env } from '../../src/env';
import { JwtMiddleware } from '../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../src/services/Prisma.service';
import { JWT_CONFIG } from '../helpers/consts';
import { prisma } from '../helpers/prisma';

/**
 * Reusable request body for POST /api/credentials
 */
const REGISTRATION_PAYLOAD = {
  challenge: CHALLENGE_BASE64URL,
  rp: {
    id: RP_ID,
    name: RP_ID,
  },
  pubKeyCredParams: [{ alg: COSEKeyAlgorithm.ES256, type: 'public-key' }],
};

/**
 * Reusable base query for GET /api/credentials
 */
const BASE_AUTH_QUERY = {
  challenge: CHALLENGE_BASE64URL,
  rpId: RP_ID,
};

/**
 * Helper to perform and verify a successful registration (POST /api/credentials)
 */
const performAndVerifyRegistration = async (opts: {
  app: App;
  token: string;
  payload: Record<string, unknown>;
}): Promise<{
  response: Response;
  verification: VerifiedRegistrationResponse;
  webAuthnCredentialId: string;
}> => {
  const { app, token, payload } = opts;

  const response = await request(app)
    .post('/api/credentials/create')
    .set('Authorization', `Bearer ${token}`)
    .send(payload)
    .expect('Content-Type', /json/)
    .expect(200);

  const verification = await verifyRegistrationResponse({
    response: response.body as RegistrationResponseJSON,
    expectedChallenge: CHALLENGE_BASE64URL,
    expectedOrigin: RP_ID,
    expectedRPID: RP_ID,
    requireUserVerification: true, // Authenticator does perform UV
    requireUserPresence: false, // Authenticator does NOT perform UP
  });

  expect(verification.verified).toBe(true);
  expect(verification.registrationInfo?.credential.counter).toBe(0);

  expect(
    COSEKey.fromBuffer(
      verification.registrationInfo!.credential.publicKey,
    ).toJwk(),
  ).toMatchObject({
    crv: 'P-256',
    d: undefined,
    dp: undefined,
    dq: undefined,
    e: undefined,
    k: undefined,
    keyOps: undefined,
    kid: undefined,
    kty: 'EC',
    n: undefined,
    p: undefined,
    q: undefined,
    qi: undefined,
    t: undefined,
    x: expect.any(String),
    y: expect.any(String),
  });

  expect(response.body).toStrictEqual({
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      attestationObject: expect.any(String),
      clientDataJSON:
        'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6ImV4YW1wbGUuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ',
    },
    type: 'public-key',
  });

  return {
    response,
    verification,
    webAuthnCredentialId: bytesToUuid(
      Buffer.from(response.body.id, 'base64url'),
    ),
  };
};

/**
 * Helper to perform and verify a successful authentication (GET /api/credentials)
 */
const performAndVerifyAuthRequest = async (opts: {
  app: App;
  queryOptions?: Record<string, unknown>;
  registrationVerification: VerifiedRegistrationResponse;
  token: string;
  expectedNewCounter: number;
}): Promise<{
  response: Response;
  verification: VerifiedAuthenticationResponse;
}> => {
  const {
    app,
    queryOptions,
    registrationVerification,
    token,
    expectedNewCounter,
  } = opts;

  const { id: credentialID, publicKey: credentialPublicKey } =
    registrationVerification.registrationInfo!.credential;

  const query = {
    ...BASE_AUTH_QUERY,
    ...queryOptions,
  };

  const response = await request(app)
    .post('/api/credentials/get')
    .set('Authorization', `Bearer ${token}`)
    .send(query)
    .expect('Content-Type', /json/)
    .expect(200);

  const verification = await verifyAuthenticationResponse({
    response: response.body as AuthenticationResponseJSON,
    expectedChallenge: CHALLENGE_BASE64URL,
    expectedOrigin: RP_ID,
    expectedRPID: RP_ID,

    credential: {
      id: credentialID,
      publicKey: credentialPublicKey,
      // The counter is stateful from the previous test verification
      counter: expectedNewCounter - 1,
    },
    requireUserVerification: true,
  });

  // The most important check: confirm that the authentication was successful.
  expect(verification.verified).toBe(true);

  // A critical security check: ensure the signature counter has incremented.
  expect(verification.authenticationInfo.newCounter).toBe(expectedNewCounter);

  expect(response.body).toStrictEqual({
    clientExtensionResults: {},
    id: expect.any(String),
    rawId: expect.any(String),
    response: {
      authenticatorData: expect.any(String),
      clientDataJSON:
        'eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6ImV4YW1wbGUuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ',
      signature: expect.any(String),
      userHandle: null,
    },
    type: 'public-key',
  });

  return { response, verification };
};

const jwtIssuer = new JwtIssuer({
  prisma,
  encryptionKey: env.ENCRYPTION_KEY,
  config: JWT_CONFIG,
});

describe('CredentialsController', () => {
  let app: INestApplication;
  let token: string;

  let registrationVerification: VerifiedRegistrationResponse;
  let base64CredentialID: string;

  beforeAll(async () => {
    token = await jwtIssuer.sign(MOCK_PERSONAL_JWT_PAYLOAD);

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

    const { response, verification } = await performAndVerifyRegistration({
      app: app.getHttpServer(),
      token,
      payload: REGISTRATION_PAYLOAD,
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
      const { webAuthnCredentialId } = await performAndVerifyRegistration({
        app: app.getHttpServer(),
        token,
        payload: {
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            ...REGISTRATION_PAYLOAD.pubKeyCredParams,
            { alg: COSEKeyAlgorithm.ES512, type: 'public-key' },
          ],
        },
      });

      await prisma.webAuthnCredential.delete({
        where: {
          id: webAuthnCredentialId,
        },
      });
    });

    test('With multiple unsupported and one supported `pubKeyCredParams`', async () => {
      const { webAuthnCredentialId } = await performAndVerifyRegistration({
        app: app.getHttpServer(),
        token,
        payload: {
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            { alg: -8, type: 'public-key' },
            ...REGISTRATION_PAYLOAD.pubKeyCredParams,
          ],
        },
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
        .send({
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            { alg: -8, type: 'public-key' },
            { alg: -9, type: 'public-key' },
          ],
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .send(REGISTRATION_PAYLOAD)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With short `challenge`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...REGISTRATION_PAYLOAD,
          challenge: randomBytes(10).toString('base64url'),
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With wrong `pubKeyCredParams.type`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            { ...REGISTRATION_PAYLOAD.pubKeyCredParams[0], type: 'wrong-type' },
          ],
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With wrong symetric `pubKeyCredParams.alg`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            // 1 = AES-GCM mode w/ 128-bit key, 128-bit tag
            { ...REGISTRATION_PAYLOAD.pubKeyCredParams[0], alg: 1 },
          ],
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With unsupported asymetric `pubKeyCredParams.alg`', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...REGISTRATION_PAYLOAD,
          pubKeyCredParams: [
            // -47 = ES256K	ECDSA using secp256k1 curve and SHA-256
            { ...REGISTRATION_PAYLOAD.pubKeyCredParams[0], alg: -47 },
          ],
        })
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('POST /api/credentials/get', () => {
    test('As authenticated user', async () => {
      await performAndVerifyAuthRequest({
        app: app.getHttpServer(),
        token,
        queryOptions: {
          allowCredentials: [
            {
              id: base64CredentialID,
              type: 'public-key',
            },
          ],
        },
        registrationVerification,
        expectedNewCounter: 1,
      });
    });

    test('With empty `allowCredentials` as authenticated user', async () => {
      await performAndVerifyAuthRequest({
        app: app.getHttpServer(),
        token,
        queryOptions: {
          allowCredentials: [],
        },
        registrationVerification,
        expectedNewCounter: 2,
      });
    });

    test('With undefined `allowCredentials` as authenticated user', async () => {
      await performAndVerifyAuthRequest({
        app: app.getHttpServer(),
        token,
        registrationVerification,
        expectedNewCounter: 3,
      });
    });

    test('As guest', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: base64CredentialID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .send(query)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With wrong token', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: base64CredentialID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer WRONG_TOKEN`)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('`allowCredentials` that does not exists', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: WRONG_UUID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('`rpId` that does not exists', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        rpId: 'WRONG_RP_ID',
        allowCredentials: [
          {
            id: base64CredentialID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('Short `challenge`', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        challenge: randomBytes(10).toString('base64url'),
        allowCredentials: [
          {
            id: base64CredentialID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With undefined `rpId`', async () => {
      const query = {
        ...BASE_AUTH_QUERY,
        rpId: undefined,
        allowCredentials: [
          {
            id: base64CredentialID,
            type: 'public-key',
          },
        ],
      };

      await request(app.getHttpServer())
        .post('/api/credentials/get')
        .set('Authorization', `Bearer ${token}`)
        .send(query)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
