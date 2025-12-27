import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { set } from '@repo/core/__tests__/helpers';
import {
  CHALLENGE_BASE64URL,
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import {
  PublicKeyCredentialType,
  UserVerificationRequirement,
} from '@repo/virtual-authenticator/enums';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import request from 'supertest';
import { describe, test, afterAll, beforeAll } from 'vitest';
import z from 'zod';

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
    authenticatorSelection: {
      userVerification: 'required' as const,
    },
  },
  meta: {
    origin: RP_ORIGIN,
  },
} as z.input<typeof CreateCredentialBodySchema>;

/**
 * Reusable base query for GET /api/credentials
 */
const PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD = {
  publicKeyCredentialRequestOptions: {
    challenge: CHALLENGE_BASE64URL,
    rpId: RP_ID,
    userVerification: UserVerificationRequirement.REQUIRED,
  },
  meta: {
    origin: RP_ORIGIN,
  },
} as z.input<typeof GetCredentialBodySchema>;

const jwtIssuer = new JwtIssuer({
  prisma,
  encryptionKey: 'secret',
  config: JWT_CONFIG,
});

describe('CredentialsController - POST /api/credentials/get', () => {
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
        expectStatus: 200,
      });

    // Save the results for use in other tests
    registrationVerification = verification!;
    base64CredentialID = response.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.jwks.deleteMany();
    await prisma.webAuthnPublicKeyCredential.deleteMany();
    await prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany();

    await app.close();
  });

  test('As authenticated user', async () => {
    const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
      publicKeyCredentialRequestOptions: {
        allowCredentials: [
          {
            id: base64CredentialID,
            type: PublicKeyCredentialType.PUBLIC_KEY,
          },
        ],
      },
    });

    await performPublicKeyCredentialRequestAndVerify({
      app: app.getHttpServer(),
      token: undefined,
      payload,
      registrationVerification,
      expectedNewCounter: 1,
      expectStatus: 401,
    });
  });

  // test('With empty `allowCredentials` as authenticated user', async () => {
  //   await performPublicKeyCredentialRequestAndVerify({
  //     app: app.getHttpServer(),
  //     token,
  //     payload: {
  //       ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //       publicKeyCredentialRequestOptions: {
  //         ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD.publicKeyCredentialRequestOptions,
  //         allowCredentials: [],
  //       },
  //     },
  //     registrationVerification,
  //     expectedNewCounter: 2,
  //   });
  // });

  // test('With undefined `allowCredentials` as authenticated user', async () => {
  //   await performPublicKeyCredentialRequestAndVerify({
  //     app: app.getHttpServer(),
  //     token,
  //     payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //     registrationVerification,
  //     expectedNewCounter: 3,
  //   });
  // });

  // test('As guest', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions.allowCredentials',
  //         () => [
  //           {
  //             id: base64CredentialID,
  //             type: 'public-key',
  //           },
  //         ],
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(401);
  // });

  // test('With wrong token', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .set('Authorization', `Bearer WRONG_TOKEN`)
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions.allowCredentials',
  //         () => [
  //           {
  //             id: base64CredentialID,
  //             type: 'public-key',
  //           },
  //         ],
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(401);
  // });

  // test('`allowCredentials` that does not exists', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions.allowCredentials',
  //         () => [
  //           {
  //             id: WRONG_UUID,
  //             type: 'public-key',
  //           },
  //         ],
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(404);
  // });

  // test('`rpId` that does not exists', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions',
  //         (val) => ({
  //           ...val,
  //           rpId: 'WRONG_RP_ID',
  //           allowCredentials: [
  //             {
  //               id: base64CredentialID,
  //               type: 'public-key',
  //             },
  //           ],
  //         }),
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(404);
  // });

  // test('Short `challenge`', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions',
  //         (val) => ({
  //           ...val,
  //           challenge: randomBytes(10).toString('base64url'),
  //           allowCredentials: [
  //             {
  //               id: base64CredentialID,
  //               type: 'public-key',
  //             },
  //           ],
  //         }),
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(400);
  // });

  // test('With undefined `rpId`', async () => {
  //   await request(app.getHttpServer())
  //     .post('/api/credentials/get')
  //     .set('Authorization', `Bearer ${token}`)
  //     .send(
  //       setDeep(
  //         PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
  //         'publicKeyCredentialRequestOptions',
  //         (val) => ({
  //           ...val,
  //           rpId: undefined,
  //           allowCredentials: [
  //             {
  //               id: base64CredentialID,
  //               type: 'public-key',
  //             },
  //           ],
  //         }),
  //       ),
  //     )
  //     .expect('Content-Type', /json/)
  //     .expect(400);
  // });
});
