/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Because app.getHttpServer() has type any
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { WRONG_UUID } from '@repo/core/__tests__/helpers';
import {
  upsertTestingWebAuthnPublicKeyCredential,
  WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { KeyClient } from '@azure/keyvault-keys';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import { PrismaClientExtended } from '@repo/prisma';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../../src/app.module';
import { JwtMiddleware } from '../../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../../src/services/Prisma.service';
import { JWT_CONFIG } from '../../helpers/consts';

const API_PATH = `/api/webauthn-public-key-credentials/${WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID}`;

const prisma = PrismaClientExtended.createInstance();

const jwtIssuer = new JwtIssuer({
  prisma,
  encryptionKey: 'secret',
  config: JWT_CONFIG,
});

const cleanupWebAuthnPublicKeyCredentials = async () => {
  await prisma.$transaction([
    prisma.webAuthnPublicKeyCredential.deleteMany(),
    prisma.webAuthnPublicKeyCredentialKeyVaultKeyMeta.deleteMany(),
  ]);
};

describe('WebAuthnPublicKeyCredentialsController Get - GET /api/webauthn-public-key-credentials/:id', () => {
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
            return await jwtIssuer.jsonWebKeySet();
          },
        }),
      )
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(KeyClient)
      .useValue({ beginDeleteKey: () => ({ pollUntilDone: () => null }) })
      .compile();

    app = appRef.createNestApplication();

    const appModule = app.get(AppModule);
    appModule.configure = (consumer) => {
      consumer.apply(JwtMiddleware).forRoutes('/api');
    };

    await upsertTestingUser({ prisma });
    await upsertTestingWebAuthnPublicKeyCredential({ prisma });

    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.jwks.deleteMany();
    await cleanupWebAuthnPublicKeyCredentials();

    await app.close();
  });

  describe('Authorization', () => {
    test('Should not work when unauthorized', async () => {
      await request(app.getHttpServer())
        .delete(API_PATH)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token is invalid', async () => {
      const token = 'INVALID_TOKEN';

      await request(app.getHttpServer())
        .delete(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token do not have any permission', async () => {
      const token = await jwtIssuer.sign({
        ...USER_JWT_PAYLOAD,
        permissions: [],
      });

      await request(app.getHttpServer())
        .delete(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(403);
    });

    test('Should not work when token is for user that does not exists', async () => {
      const token = await jwtIssuer.sign({
        ...USER_JWT_PAYLOAD,
        userId: WRONG_UUID,
      });

      const response = await request(app.getHttpServer())
        .delete(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        // The API server do not check if the user exists but response should be empty
        .expect(404);

      expect(response.body).toMatchInlineSnapshot(`
        {
          "code": "WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_NOT_FOUND",
          "message": "WebAuthn Public Key Credential Not Found.",
          "name": "WebAuthnPublicKeyCredentialNotFound",
        }
      `);
    });

    test('Should work as authenticated user', async () => {
      const listWebAuthnPublicKeyCredentialsResponse = await request(
        app.getHttpServer(),
      )
        .delete(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(listWebAuthnPublicKeyCredentialsResponse.body)
        .toMatchInlineSnapshot(`
        {
          "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY",
          "counter": 0,
          "createdAt": "1970-01-01T00:00:00.000Z",
          "id": "0cc9f49f-2967-404e-b45c-3dc7110681c5",
          "name": null,
          "rpId": "example.com",
          "transports": [],
          "updatedAt": "1970-01-01T00:00:00.000Z",
          "userId": "f84468a3-f383-41ce-83e2-5aab4a712c15",
          "webAuthnPublicKeyCredentialKeyMetaType": "KEY_VAULT",
          "webAuthnPublicKeyCredentialKeyVaultKeyMeta": {
            "createdAt": "1970-01-01T00:00:00.000Z",
            "hsm": false,
            "id": "2721c4a0-1581-49f2-8fcc-8677a84e717d",
            "keyVaultKeyId": "4b45595f5641554c545f4b45595f4944",
            "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
            "updatedAt": "1970-01-01T00:00:00.000Z",
          },
        }
      `);

      const webAuthnPublicKeyCredential =
        await prisma.webAuthnPublicKeyCredential.findUnique({
          where: {
            id: WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID,
          },
        });

      expect(webAuthnPublicKeyCredential).toBe(null);
    });
  });
});
