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
import { HttpStatusCode } from '@repo/http';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import {
  CredentialSelectAgentException,
  UserPresenceRequiredAgentException,
  UserVerificationRequiredAgentException,
} from '@repo/virtual-authenticator/authenticatorAgent';
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
  nextState: {},
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
        expectStatus: HttpStatusCode.OK_200,
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
        expectStatus: HttpStatusCode.UNAUTHORIZED_401,
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
        expectStatus: HttpStatusCode.UNAUTHORIZED_401,
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
        expectStatus: HttpStatusCode.FORBIDDEN_403,
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
        expectStatus: HttpStatusCode.BAD_REQUEST_400,
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
        expectStatus: HttpStatusCode.OK_200,
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

  describe('AuthenticationState', () => {
    const getPayloadWithCredential = () =>
      set(PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD, {
        publicKeyCredentialRequestOptions: {
          allowCredentials: [
            {
              id: base64urlCredentialId,
              type: PublicKeyCredentialType.PUBLIC_KEY,
            },
          ],
        },
      });

    describe('Invalid CredentialSelection state', () => {
      // Credential selection only triggers when there are 2+ applicable credentials
      beforeEach(async () => {
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
          expectStatus: HttpStatusCode.OK_200,
        });
      });

      test('Should return CredentialSelectAgentException when no allowCredentials and no state token', async () => {
        const { response } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
          registrationVerification,
          expectStatus: CredentialSelectAgentException.status,
          skipStateFlow: true,
        });

        expect(response.body).toMatchObject({
          code: CredentialSelectAgentException.code,
          data: {
            stateToken: expect.any(String),
            credentialOptions: expect.any(Array),
          },
        });
      });

      test('Should resolve credential selection and proceed to UP when credentialId is provided', async () => {
        // First request — should return credential selection required
        const { response: firstResponse } =
          await performPublicKeyCredentialRequestAndVerify({
            app: app.getHttpServer(),
            token,
            payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            registrationVerification,
            expectStatus: CredentialSelectAgentException.status,
            skipStateFlow: true,
          });

        const stateToken = firstResponse.body.data.stateToken;
        const credentialId = firstResponse.body.data.credentialOptions[0].id;

        // Second request with credentialId — should proceed to UP
        const { response } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: {
            ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
            prevStateToken: stateToken,
            nextState: { credentialId },
          },
          registrationVerification,
          expectStatus: UserPresenceRequiredAgentException.status,
          skipStateFlow: true,
        });

        expect(response.body).toMatchObject({
          code: UserPresenceRequiredAgentException.code,
          data: {
            stateToken: expect.any(String),
          },
        });
      });
    });

    describe('Invalid UserPresence state', () => {
      test('Should return UserPresenceRequired when allowCredentials provided but no UP', async () => {
        const payload = getPayloadWithCredential();

        const { response } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload,
          registrationVerification,
          expectStatus: UserPresenceRequiredAgentException.status,
          skipStateFlow: true,
        });

        expect(response.body).toMatchObject({
          code: UserPresenceRequiredAgentException.code,
          data: {
            stateToken: expect.any(String),
            requireUserPresence: true,
          },
        });
      });

      test('Should return 400 with UserPresenceRequired when nextState.up is false', async () => {
        const payload = getPayloadWithCredential();

        const { response: firstResponse } =
          await performPublicKeyCredentialRequestAndVerify({
            app: app.getHttpServer(),
            token,
            payload,
            registrationVerification,
            expectStatus: UserPresenceRequiredAgentException.status,
            skipStateFlow: true,
          });

        const stateToken = firstResponse.body.data.stateToken;

        const { response } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: {
            ...payload,
            prevStateToken: stateToken,
            nextState: { up: false },
          },
          registrationVerification,
          expectStatus: UserPresenceRequiredAgentException.status,
          skipStateFlow: true,
        });

        expect(response.body).toMatchObject({
          code: UserPresenceRequiredAgentException.code,
          data: {
            stateToken: expect.any(String),
            requireUserPresence: true,
          },
        });
      });
    });

    describe('Invalid UserVerification state', () => {
      test('Should return UserVerificationRequired after UP is resolved when UV is required', async () => {
        const payload = getPayloadWithCredential();

        // First request — UP required
        const { response: firstResponse } =
          await performPublicKeyCredentialRequestAndVerify({
            app: app.getHttpServer(),
            token,
            payload,
            registrationVerification,
            expectStatus: UserPresenceRequiredAgentException.status,
            skipStateFlow: true,
          });

        expect(firstResponse.body.code).toBe(
          UserPresenceRequiredAgentException.code,
        );
        const stateToken = firstResponse.body.data.stateToken;

        // Second request with up: true — UV required
        const { response } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: {
            ...payload,
            prevStateToken: stateToken,
            nextState: { up: true },
          },
          registrationVerification,
          expectStatus: UserVerificationRequiredAgentException.status,
          skipStateFlow: true,
        });

        expect(response.body).toMatchObject({
          code: UserVerificationRequiredAgentException.code,
          data: {
            stateToken: expect.any(String),
            requireUserVerification: true,
          },
        });
      });
    });

    describe('Batch state', () => {
      test('Should succeed when up and uv are provided in a single retry with allowCredentials', async () => {
        const payload = getPayloadWithCredential();

        // First request — UP required
        const { response: firstResponse } =
          await performPublicKeyCredentialRequestAndVerify({
            app: app.getHttpServer(),
            token,
            payload,
            registrationVerification,
            expectStatus: UserPresenceRequiredAgentException.status,
            skipStateFlow: true,
          });

        expect(firstResponse.body.code).toBe(
          UserPresenceRequiredAgentException.code,
        );
        const stateToken = firstResponse.body.data.stateToken;

        // Provide both up and uv in one step — should succeed
        await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: {
            ...payload,
            prevStateToken: stateToken,
            nextState: { up: true, uv: true },
          },
          registrationVerification,
          expectedNewCounter: 1,
          expectStatus: HttpStatusCode.OK_200,
          skipStateFlow: true,
        });
      });

      test('Should succeed via state token retry loop with retries', async () => {
        const payload = getPayloadWithCredential();

        const { retries } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload,
          registrationVerification,
          expectedNewCounter: 1,
          expectStatus: HttpStatusCode.OK_200,
        });

        // At least 1 retry for UP
        expect(retries).toBeGreaterThanOrEqual(1);
      });

      test('Should succeed via state token retry loop without allowCredentials', async () => {
        const { retries } = await performPublicKeyCredentialRequestAndVerify({
          app: app.getHttpServer(),
          token,
          payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
          registrationVerification,
          expectedNewCounter: 1,
          expectStatus: HttpStatusCode.OK_200,
        });

        // At least 1 retry for UP (no credential selection with single credential)
        expect(retries).toBeGreaterThanOrEqual(1);
      });

      describe('With multiple credentials', () => {
        // Credential selection only triggers when there are 2+ applicable credentials
        beforeEach(async () => {
          await performPublicKeyCredentialRegistrationAndVerify({
            app: app.getHttpServer(),
            token,
            payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
            expectStatus: HttpStatusCode.OK_200,
          });
        });

        test('Should succeed with credentialId + up + uv in a single batch retry', async () => {
          // First request without allowCredentials — credential selection required
          const { response: firstResponse } =
            await performPublicKeyCredentialRequestAndVerify({
              app: app.getHttpServer(),
              token,
              payload: PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
              registrationVerification,
              expectStatus: CredentialSelectAgentException.status,
              skipStateFlow: true,
            });

          expect(firstResponse.body.code).toBe(
            CredentialSelectAgentException.code,
          );
          const stateToken = firstResponse.body.data.stateToken;
          const credentialId = firstResponse.body.data.credentialOptions[0].id;

          // Provide credentialId + up + uv in one step — should succeed
          await performPublicKeyCredentialRequestAndVerify({
            app: app.getHttpServer(),
            token,
            payload: {
              ...PUBLIC_KEY_CREDENTIAL_REQUEST_PAYLOAD,
              prevStateToken: stateToken,
              nextState: { credentialId, up: true, uv: true },
            },
            registrationVerification,
            expectedNewCounter: 1,
            expectStatus: HttpStatusCode.OK_200,
            skipStateFlow: true,
          });
        });
      });
    });
  });
});
