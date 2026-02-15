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
import { JwtAudience } from '@repo/auth';
import {
  CreateCredentialBodySchema,
  GetCredentialBodySchema,
} from '@repo/contract/dto';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import {
  PublicKeyCredentialType,
  UserVerification,
} from '@repo/virtual-authenticator/enums';
import { CredentialOptionsEmpty } from '@repo/virtual-authenticator/exceptions';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { randomUUID } from 'node:crypto';
import {
  describe,
  test,
  afterAll,
  beforeAll,
  expect,
  beforeEach,
  afterEach,
} from 'vitest';
import z from 'zod';

import { AppModule } from '../../../src/app.module';
import { JwtMiddleware } from '../../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../../src/services/Prisma.service';
import { JWT_CONFIG } from '../../helpers/consts';
import { jwtIssuer, getJSONWebKeySet } from '../../helpers/jwt';
import { prisma } from '../../helpers/prisma';
import { performPublicKeyCredentialRegistrationAndVerify } from './performPublicKeyCredentialRegistrationAndVerify';
import { performPublicKeyCredentialRequestAndVerify } from './performPublicKeyCredentialRequestAndVerify';

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
    pubKeyCredParams: [
      { alg: COSEKeyAlgorithm.ES256, type: PublicKeyCredentialType.PUBLIC_KEY },
    ],
    authenticatorSelection: {
      userVerification: UserVerification.REQUIRED,
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
    userVerification: UserVerification.REQUIRED,
  },
  meta: {
    origin: RP_ORIGIN,
  },
} as z.input<typeof GetCredentialBodySchema>;

describe('CredentialsController - POST /api/credentials/get', () => {
  let app: INestApplication;
  let token: string;

  let registrationVerification: VerifiedRegistrationResponse;
  let base64urlCredentialId: string;

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
            return await getJSONWebKeySet();
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
  });

  beforeEach(async () => {
    const { response, verification } =
      await performPublicKeyCredentialRegistrationAndVerify({
        app: app.getHttpServer(),
        token,
        payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
        expectStatus: 200,
      });

    // Save the results for use in other tests
    registrationVerification = verification!;
    base64urlCredentialId = response.body.id;
  });

  afterEach(async () => {
    await prisma.webAuthnPublicKeyCredential.deleteMany();
    await prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  describe('Authorization', () => {
    test('Should not work when unauthorized', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        registrationVerification,
        token: undefined,
        payload,
        expectStatus: 401,
      });
    });

    test('Should not work when token is invalid', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        registrationVerification,
        token: 'INVALID_TOKEN',
        payload,
        expectStatus: 401,
      });
    });

    test('Should not work when token do not have any permission', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        registrationVerification,
        token: await jwtIssuer.sign({
          ...USER_JWT_PAYLOAD,
          permissions: [],
        }),
        payload,
        expectStatus: 403,
      });
    });

    test('Should not work when token is for user that does not exists', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

      const { response } = await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        registrationVerification,
        token: await jwtIssuer.sign({
          ...USER_JWT_PAYLOAD,
          userId: randomUUID(),
        }),
        payload,
        expectStatus: 400,
      });

      expect(response.body).toStrictEqual(
        new CredentialOptionsEmpty().toJSON(),
      );
    });

    test('As authenticated user', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

      await performPublicKeyCredentialRequestAndVerify({
        app: app.getHttpServer(),
        token,
        payload,
        registrationVerification,
        expectedNewCounter: 1,
        expectStatus: 200,
      });
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
