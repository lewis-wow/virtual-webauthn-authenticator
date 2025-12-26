/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { set, setDeep, WRONG_UUID } from '@repo/core/__tests__/helpers';
import {
  CHALLENGE_BASE64URL,
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import { CreateCredentialBodySchema } from '@repo/contract/dto';
import { RequestValidationFailed } from '@repo/exception';
import { ExceptionMapper } from '@repo/exception/mappers';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import {
  Attestation,
  PublicKeyCredentialType,
} from '@repo/virtual-authenticator/enums';
import {
  AttestationNotSupported,
  NoSupportedPubKeyCredParamFound,
} from '@repo/virtual-authenticator/exceptions';
import { PublicKeyCredentialCreationOptions } from '@repo/virtual-authenticator/zod-validation';
import { VerifiedRegistrationResponse } from '@simplewebauthn/server';
import { randomBytes } from 'node:crypto';
import { afterEach } from 'node:test';
import request from 'supertest';
import { describe, test, afterAll, beforeAll, expect } from 'vitest';
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

const cleanupWebAuthnCredentials = async () => {
  await prisma.$transaction([
    prisma.webAuthnCredential.deleteMany(),
    prisma.webAuthnCredentialKeyVaultKeyMeta.deleteMany(),
  ]);
};

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
        expectStatus: 200,
        requireUserVerification: true,
        requireUserPresence: false,
      });

    // Save the results for use in other tests
    registrationVerification = verification!;
    base64CredentialID = response.body.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  describe('POST /api/credentials/create', () => {
    afterEach(async () => {
      await cleanupWebAuthnCredentials();
    });

    describe('Authorization', () => {
      test('Should not work when unauthorized', async () => {
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
          expectStatus: 401,
        });
      });

      test('Should not work when token is invalid', async () => {
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
          expectStatus: 403,
        });
      });
    });

    /**
     * Tests for attestation parameter
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-attestation
     * @see https://www.w3.org/TR/webauthn-3/#enum-attestation-convey
     *
     * Per spec: This member specifies the Relying Party's preference regarding attestation
     * conveyance. Values: 'none', 'indirect', 'direct', 'enterprise'
     */
    describe('PublicKeyCredentialCreationOptions.attestation', () => {
      test.each([
        {
          attestation: undefined,
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        {
          attestation: Attestation.NONE,
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        {
          attestation: Attestation.DIRECT,
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
      ])('With attestation $attestation', async ({ attestation }) => {
        const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
          publicKeyCredentialCreationOptions: {
            attestation,
          },
        });

        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload,
          expectStatus: 200,
        });
      });

      test.each([
        {
          attestation: Attestation.ENTERPRISE,
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        {
          attestation: Attestation.INDIRECT,
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
      ])(
        `Should throw ${AttestationNotSupported.name} with attestation $attestation`,
        async ({ attestation }) => {
          const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
            publicKeyCredentialCreationOptions: {
              attestation,
            },
          });

          const { response } =
            await performPublicKeyCredentialRegistrationAndVerify({
              app: app.getHttpServer(),
              token,
              payload,
              expectStatus: 400,
            });

          expect(response.body).toStrictEqual(
            ExceptionMapper.exceptionToResponseBody(
              new AttestationNotSupported(),
            ),
          );
        },
      );

      test('Shold throw type mismatch when attestation is not in enum', async () => {
        const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
          publicKeyCredentialCreationOptions: {
            attestation: 'INVALID_ATTESTATION' as Attestation,
          },
        });

        const { response } =
          await performPublicKeyCredentialRegistrationAndVerify({
            app: app.getHttpServer(),
            token,
            payload,
            expectStatus: 400,
          });

        expect(response.body).toStrictEqual(
          ExceptionMapper.exceptionToResponseBody(
            new RequestValidationFailed(),
          ),
        );
      });
    });

    /**
     * Tests for pubKeyCredParams parameter
     * @see https://www.w3.org/TR/webauthn-3/#dom-publickeycredentialcreationoptions-pubkeycredparams
     * @see https://www.w3.org/TR/webauthn-3/#dictdef-publickeycredentialparameters
     *
     * Per spec: This member contains information about the desired properties of the credential
     * to be created. The sequence is ordered from most preferred to least preferred.
     */
    describe('PublicKeyCredentialCreationOptions.pubKeyCredParams', () => {
      test('Should work with multiple unsupported and one supported pubKeyCredParams', async () => {
        const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
          publicKeyCredentialCreationOptions: {
            pubKeyCredParams: (pubKeyCredParams) => [
              { type: 'WRONG_TYPE', alg: COSEKeyAlgorithm.ES256 },
              {
                type: PublicKeyCredentialType.PUBLIC_KEY,
                alg: -8,
              },
              {
                type: 'WRONG_TYPE',
                alg: COSEKeyAlgorithm.ES256,
              },
              ...pubKeyCredParams,
            ],
          },
        });

        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token,
          payload,
          expectStatus: 200,
        });
      });

      test('Should throw type mismatch when pubKeyCredParams is empty', async () => {
        const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
          publicKeyCredentialCreationOptions: {
            pubKeyCredParams: [],
          },
        });

        const { response } =
          await performPublicKeyCredentialRegistrationAndVerify({
            app: app.getHttpServer(),
            token,
            payload,
            expectStatus: 400,
          });

        expect(response.body).toStrictEqual(
          ExceptionMapper.exceptionToResponseBody(
            new RequestValidationFailed(),
          ),
        );
      });

      test.each([
        {
          pubKeyCredParams: [
            { type: 'WRONG_TYPE', alg: COSEKeyAlgorithm.ES256 },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        {
          pubKeyCredParams: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: -8,
            },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
        {
          pubKeyCredParams: [
            {
              type: PublicKeyCredentialType.PUBLIC_KEY,
              alg: -8,
            },
            {
              type: 'WRONG_TYPE',
              alg: COSEKeyAlgorithm.ES256,
            },
          ],
        } satisfies Partial<PublicKeyCredentialCreationOptions>,
      ])(
        'Should throw without any supported pubKeyCredParams',
        async ({ pubKeyCredParams }) => {
          const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
            publicKeyCredentialCreationOptions: {
              pubKeyCredParams,
            },
          });

          const { response } =
            await performPublicKeyCredentialRegistrationAndVerify({
              app: app.getHttpServer(),
              token,
              payload,
              expectStatus: 400,
            });

          expect(response.body).toStrictEqual(
            ExceptionMapper.exceptionToResponseBody(
              new NoSupportedPubKeyCredParamFound(),
            ),
          );
        },
      );
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
