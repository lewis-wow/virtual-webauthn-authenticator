import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import { COSEKey } from '@repo/keys';
import {
  CHALLENGE_BASE64URL,
  MOCK_JWT_PAYLOAD,
  RP_ID,
  upsertTestingUser,
  WRONG_UUID,
} from '@repo/test-helpers';
import {
  AuthenticationResponseJSON,
  VerifiedAuthenticationResponse,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import qs from 'qs';
import request, { type Response } from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { env } from '../../src/env';
import { JwtMiddleware } from '../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../src/services/Prisma.service';
import { MockJwtAudience } from '../helpers/MockJwtAudience';
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
  pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
};

/**
 * Reusable base query for GET /api/credentials
 */
const BASE_AUTH_QUERY = {
  challenge: CHALLENGE_BASE64URL,
  rpId: RP_ID,
};

describe('CredentialsController', () => {
  let app: INestApplication;
  let createCredentialResponse: Response;
  let registrationVerification: VerifiedRegistrationResponse;
  let token: string;

  /**
   * Helper to perform and verify a successful authentication (GET /api/credentials)
   */
  const performAndVerifyAuthRequest = async (
    queryOptions: Record<string, unknown>,
    expectedCounter: number,
  ): Promise<{
    response: Response;
    verification: VerifiedAuthenticationResponse;
  }> => {
    const {
      id: credentialID,
      publicKey: credentialPublicKey,
      counter: credentialCounter,
    } = registrationVerification.registrationInfo!.credential;

    const query = qs.stringify({
      ...BASE_AUTH_QUERY,
      ...queryOptions,
    });

    const response = await request(app.getHttpServer())
      .get(`/api/credentials?${query}`)
      .set('Authorization', `Bearer ${token}`)
      .send()
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
        counter: expectedCounter - 1,
      },
      requireUserVerification: true,
    });

    // The most important check: confirm that the authentication was successful.
    expect(verification.verified).toBe(true);

    // A critical security check: ensure the signature counter has incremented.
    expect(verification.authenticationInfo.newCounter).toBe(expectedCounter);

    expect(response.body).toMatchInlineSnapshot(
      {
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
      },
      `
      {
        "clientExtensionResults": {},
        "id": Any<String>,
        "rawId": Any<String>,
        "response": {
          "authenticatorData": Any<String>,
          "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6ImV4YW1wbGUuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
          "signature": Any<String>,
          "userHandle": null,
        },
        "type": "public-key",
      }
    `,
    );

    return { response, verification };
  };

  beforeAll(async () => {
    const jwtIssuer = new JwtIssuer({
      prisma,
      encryptionKey: env.ENCRYPTION_KEY,
      config: {
        aud: 'http://localhost:3002',
        iss: 'http://localhost:3002',
      },
    });

    token = await jwtIssuer.sign(MOCK_JWT_PAYLOAD);

    const appRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(JwtAudience)
      .useValue(new MockJwtAudience(await jwtIssuer.getKeys()))
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

    createCredentialResponse = await request(app.getHttpServer())
      .post('/api/credentials')
      .set('Authorization', `Bearer ${token}`)
      .send({
        challenge: CHALLENGE_BASE64URL,
        rp: {
          id: RP_ID,
          name: RP_ID,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      })
      .expect('Content-Type', /json/)
      .expect(200);

    registrationVerification = await verifyRegistrationResponse({
      response: createCredentialResponse.body as RegistrationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: RP_ID,
      expectedRPID: RP_ID,
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  describe('POST /api/credentials', () => {
    test('As authenticated user', async () => {
      expect(
        registrationVerification.registrationInfo?.credential.counter,
      ).toBe(0);

      expect(
        COSEKey.fromBuffer(
          registrationVerification.registrationInfo!.credential.publicKey,
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

      expect(registrationVerification.verified).toBe(true);

      expect(createCredentialResponse.body).toMatchInlineSnapshot(
        {
          clientExtensionResults: {},
          id: expect.any(String),
          rawId: expect.any(String),
          response: {
            attestationObject: expect.any(String),
            clientDataJSON:
              'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6ImV4YW1wbGUuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ',
          },
          type: 'public-key',
        },
        `
      {
        "clientExtensionResults": {},
        "id": Any<String>,
        "rawId": Any<String>,
        "response": {
          "attestationObject": Any<String>,
          "clientDataJSON": "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoiWU4wZ3RDc3VoTDhIZWR3TEhCRXFtUSIsIm9yaWdpbiI6ImV4YW1wbGUuY29tIiwiY3Jvc3NPcmlnaW4iOmZhbHNlfQ",
        },
        "type": "public-key",
      }
    `,
      );
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .post('/api/credentials')
        .send(
          qs.stringify({
            challenge: CHALLENGE_BASE64URL,
            rp: {
              id: RP_ID,
              name: RP_ID,
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          }),
        )
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('GET /api/credentials', () => {
    test('As authenticated user', async () => {
      await performAndVerifyAuthRequest(
        {
          allowCredentials: [
            {
              id: createCredentialResponse.body.rawId,
              type: 'public-key',
            },
          ],
        },
        1, // Expected counter
      );
    });

    test('With empty `allowCredentials` as authenticated user', async () => {
      await performAndVerifyAuthRequest(
        {
          allowCredentials: [],
        },
        2, // Expected counter
      );
    });

    test('With undefined `allowCredentials` as authenticated user', async () => {
      await performAndVerifyAuthRequest(
        {},
        3, // Expected counter
      );
    });

    test('As guest', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: createCredentialResponse.body.id,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With wrong token', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: createCredentialResponse.body.id,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .set('Authorization', `Bearer WRONG_TOKEN`)
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('`allowCredentials` that does not exists', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        allowCredentials: [
          {
            id: WRONG_UUID,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .set('Authorization', `Bearer ${token}`)
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('`rpId` that does not exists', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        rpId: 'WRONG_RP_ID',
        allowCredentials: [
          {
            id: createCredentialResponse.body.id,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .set('Authorization', `Bearer ${token}`)
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('Short `challenge`', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        challenge: randomBytes(10).toString('base64url'),
        allowCredentials: [
          {
            id: createCredentialResponse.body.id,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .set('Authorization', `Bearer ${token}`)
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(400);
    });

    test('With undefined `rpId`', async () => {
      const query = qs.stringify({
        ...BASE_AUTH_QUERY,
        rpId: undefined,
        allowCredentials: [
          {
            id: createCredentialResponse.body.id,
            type: 'public-key',
          },
        ],
      });

      await request(app.getHttpServer())
        .get('/api/credentials')
        .set('Authorization', `Bearer ${token}`)
        .query(query)
        .send()
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });
});
