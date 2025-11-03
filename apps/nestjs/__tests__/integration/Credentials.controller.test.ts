import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { COSEKey } from '@repo/keys';
import {
  AuthenticationResponseJSON,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import request, { type Response } from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { AuthenticatedGuard } from '../../src/guards/Authenticated.guard';
import { PrismaService } from '../../src/services/Prisma.service';
import { MockAuthenticatedGuard } from '../helpers/MockAuthenticatedGuard';
import { MockJwtMiddleware } from '../helpers/MockJwtMiddleware';
import { CHALLENGE_BASE64URL, RP_ID } from '../helpers/consts';
import { upsertTestingUser } from '../helpers/upsertTestingUser';

describe('CredentialsController', () => {
  let app: INestApplication;
  let createCredentialResponse: Response;
  let registrationVerification: VerifiedRegistrationResponse;

  beforeAll(async () => {
    const appRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthenticatedGuard)
      .useClass(MockAuthenticatedGuard)
      .compile();

    app = appRef.createNestApplication();

    const appModule = app.get(AppModule);
    appModule.configure = (consumer) => {
      consumer.apply(MockJwtMiddleware).forRoutes('/api');
    };

    const prisma = app.get(PrismaService);
    await upsertTestingUser({ prisma });

    await app.init();

    createCredentialResponse = await request(app.getHttpServer())
      .post('/api/credentials')
      .set('Authorization', `Bearer MOCK_TOKEN`)
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
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  test('POST /api/credentials as user', async () => {
    expect(registrationVerification.registrationInfo?.credential.counter).toBe(
      0,
    );

    expect(
      COSEKey.fromBuffer(
        registrationVerification.registrationInfo!.credential.publicKey,
      ).toJwk(),
    ).toMatchObject({
      alg: undefined,
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

  test('GET /api/credentials as user', async () => {
    const {
      id: credentialID,
      publicKey: credentialPublicKey,
      counter: credentialCounter,
    } = registrationVerification.registrationInfo!.credential;

    const response = await request(app.getHttpServer())
      .get('/api/credentials')
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .query({
        challenge: CHALLENGE_BASE64URL,
        rpId: RP_ID,
        allowCredentials: [
          {
            id: Buffer.from(createCredentialResponse.body.rawId, 'base64url'),
            type: 'public-key',
          },
        ],
        userVerification: 'required',
      })
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    const authenticationVerification = await verifyAuthenticationResponse({
      response: response.body as AuthenticationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: RP_ID,
      expectedRPID: RP_ID,
      credential: {
        id: credentialID,
        publicKey: credentialPublicKey,
        counter: credentialCounter,
      },
      requireUserVerification: true,
    });

    // The most important check: confirm that the authentication was successful.
    expect(authenticationVerification.verified).toBe(true);

    // A critical security check: ensure the signature counter has incremented.
    // This prevents replay attacks. The server must store this new value.
    expect(authenticationVerification.authenticationInfo.newCounter).toBe(1);

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
  });
});
