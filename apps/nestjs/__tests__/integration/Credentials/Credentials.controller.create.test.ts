import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { set, WRONG_UUID } from '@repo/core/__tests__/helpers';
import {
  CHALLENGE_BASE64URL,
  RP_ID,
  RP_ORIGIN,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience } from '@repo/auth';
import { CreateCredentialBodySchema } from '@repo/contract/dto';
import { RequestValidationFailed } from '@repo/exception';
import { COSEKeyAlgorithm } from '@repo/keys/enums';
import {
  Attestation,
  PublicKeyCredentialType,
  UserVerification,
} from '@repo/virtual-authenticator/enums';
import { UserNotExists } from '@repo/virtual-authenticator/exceptions';
import { PublicKeyCredentialCreationOptions } from '@repo/virtual-authenticator/validation';
import { randomBytes } from 'node:crypto';
import { afterEach } from 'node:test';
import { describe, test, afterAll, beforeAll, expect } from 'vitest';
import z from 'zod';

import { CredentialTypesNotSupported } from '../../../../../packages/virtual-authenticator/src/exceptions/CredentialTypesNotSupported';
import { AppModule } from '../../../src/app.module';
import { JwtMiddleware } from '../../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../../src/services/Prisma.service';
import { JWT_CONFIG } from '../../helpers/consts';
import { jwtIssuer, getJSONWebKeySet } from '../../helpers/jwt';
import { prisma } from '../../helpers/prisma';
import { performPublicKeyCredentialRegistrationAndVerify } from './performPublicKeyCredentialRegistrationAndVerify';

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

const cleanupWebAuthnPublicKeyCredentials = async () => {
  await prisma.$transaction([
    prisma.webAuthnPublicKeyCredential.deleteMany(),
    prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
  ]);
};

describe('CredentialsController - POST /api/credentials/create', () => {
  let app: INestApplication;
  let token: string;

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

  afterEach(async () => {
    await cleanupWebAuthnPublicKeyCredentials();
  });

  afterAll(async () => {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.jwks.deleteMany(),
    ]);

    await app.close();
  });

  describe('Authorization', () => {
    test('Should not work when unauthorized', async () => {
      await performPublicKeyCredentialRegistrationAndVerify({
        app: app.getHttpServer(),
        token: undefined,
        payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
        expectStatus: 401,
      });
    });

    test('Should not work when token is invalid', async () => {
      await performPublicKeyCredentialRegistrationAndVerify({
        app: app.getHttpServer(),
        token: 'INVALID_TOKEN',
        payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
        expectStatus: 401,
      });
    });

    test('Should not work when token do not have any permission', async () => {
      await performPublicKeyCredentialRegistrationAndVerify({
        app: app.getHttpServer(),
        token: await jwtIssuer.sign({
          ...USER_JWT_PAYLOAD,
          permissions: [],
        }),
        payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
        expectStatus: 403,
      });
    });

    test('Should not work when token is for user that does not exists', async () => {
      const { response } =
        await performPublicKeyCredentialRegistrationAndVerify({
          app: app.getHttpServer(),
          token: await jwtIssuer.sign({
            ...USER_JWT_PAYLOAD,
            userId: WRONG_UUID,
          }),
          payload: PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD,
          expectStatus: 404,
        });

      expect(response.body).toStrictEqual(new UserNotExists().toJSON());
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
      {
        attestation: Attestation.ENTERPRISE,
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        attestation: Attestation.INDIRECT,
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
        new RequestValidationFailed().toJSON(),
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
              alg: -999, // Unsupported algorithm
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

    test('Should work when pubKeyCredParams is empty', async () => {
      const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
        publicKeyCredentialCreationOptions: {
          pubKeyCredParams: [],
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
        pubKeyCredParams: [{ type: 'WRONG_TYPE', alg: COSEKeyAlgorithm.ES256 }],
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: -999, // Unsupported algorithm
          },
        ],
      } satisfies Partial<PublicKeyCredentialCreationOptions>,
      {
        pubKeyCredParams: [
          {
            type: PublicKeyCredentialType.PUBLIC_KEY,
            alg: -999, // Unsupported algorithm
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
          new CredentialTypesNotSupported().toJSON(),
        );
      },
    );
  });

  test('Should work with short `challenge`', async () => {
    const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
      publicKeyCredentialCreationOptions: {
        challenge: randomBytes(10).toString('base64url'),
      },
    });

    await performPublicKeyCredentialRegistrationAndVerify({
      app: app.getHttpServer(),
      token,
      payload,
      expectStatus: 200,
    });
  });

  test('With wrong `pubKeyCredParams.type`', async () => {
    const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
      publicKeyCredentialCreationOptions: {
        pubKeyCredParams: (pubKeyCredParams) => [
          { ...pubKeyCredParams[0]!, type: 'WRONG_TYPE' },
        ],
      },
    });

    await performPublicKeyCredentialRegistrationAndVerify({
      app: app.getHttpServer(),
      token,
      payload,
      expectStatus: 400,
    });
  });

  test('With wrong symetric `pubKeyCredParams.alg`', async () => {
    const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
      publicKeyCredentialCreationOptions: {
        pubKeyCredParams: (pubKeyCredParams) => [
          // 1 = AES-GCM mode w/ 128-bit key, 128-bit tag
          { ...pubKeyCredParams[0]!, alg: 1 },
        ],
      },
    });

    await performPublicKeyCredentialRegistrationAndVerify({
      app: app.getHttpServer(),
      token,
      payload,
      expectStatus: 400,
    });
  });

  test('With unsupported asymetric `pubKeyCredParams.alg`', async () => {
    const payload = set(PUBLIC_KEY_CREDENTIAL_CREATION_PAYLOAD, {
      publicKeyCredentialCreationOptions: {
        pubKeyCredParams: (pubKeyCredParams) => [
          // -47 = ES256K	ECDSA using secp256k1 curve and SHA-256
          { ...pubKeyCredParams[0]!, alg: -47 },
        ],
      },
    });

    await performPublicKeyCredentialRegistrationAndVerify({
      app: app.getHttpServer(),
      token,
      payload,
      expectStatus: 400,
    });
  });
});
