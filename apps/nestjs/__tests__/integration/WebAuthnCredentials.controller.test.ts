/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { WRONG_UUID } from '@repo/core/__tests__/helpers';
import {
  upsertTestingWebAuthnCredential,
  WEBAUTHN_CREDENTIAL_ID,
} from '@repo/virtual-authenticator/__tests__/helpers';

import { KeyClient } from '@azure/keyvault-keys';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience, JwtIssuer } from '@repo/auth';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { env } from '../../src/env';
import { JwtMiddleware } from '../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../src/services/Prisma.service';
import { JWT_CONFIG } from '../helpers/consts';
import { prisma } from '../helpers/prisma';

describe('WebAuthnCredentialsController', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const jwtIssuer = new JwtIssuer({
      prisma,
      encryptionKey: env.ENCRYPTION_KEY,
      config: {
        aud: 'http://localhost:3002',
        iss: 'http://localhost:3002',
      },
    });

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
    await upsertTestingWebAuthnCredential({ prisma });

    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany({
      where: {
        id: {
          in: [WEBAUTHN_CREDENTIAL_ID],
        },
      },
    });
    await prisma.jwks.deleteMany();

    await app.close();
  });

  describe('GET /api/webauthn-credentials', () => {
    test('As authenticated user', async () => {
      const listWebAuthnCredentialsResponse = await request(app.getHttpServer())
        .get('/api/webauthn-credentials')
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(listWebAuthnCredentialsResponse.body).toMatchInlineSnapshot(`
        {
          "data": [
            {
              "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY",
              "apiKeyId": null,
              "counter": 0,
              "id": "0cc9f49f-2967-404e-b45c-3dc7110681c5",
              "name": null,
              "rpId": "example.com",
              "transports": [],
              "userId": "f84468a3-f383-41ce-83e2-5aab4a712c15",
              "webAuthnCredentialKeyMetaType": "KEY_VAULT",
              "webAuthnCredentialKeyVaultKeyMeta": {
                "createdAt": "1970-01-01T00:00:00.000Z",
                "hsm": false,
                "id": "2721c4a0-1581-49f2-8fcc-8677a84e717d",
                "keyVaultKeyId": "4b45595f5641554c545f4b45595f4944",
                "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
                "updatedAt": "1970-01-01T00:00:00.000Z",
              },
            },
          ],
          "meta": {
            "hasNext": false,
            "nextCursor": null,
          },
        }
      `);
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .get('/api/webauthn-credentials')
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('GET /api/webauthn-credentials/:id', () => {
    test('As authenticated user', async () => {
      const getWebAuthnCredentialResponse = await request(app.getHttpServer())
        .get(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(getWebAuthnCredentialResponse.body).toMatchInlineSnapshot(`
        {
          "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY",
          "apiKeyId": null,
          "counter": 0,
          "id": "0cc9f49f-2967-404e-b45c-3dc7110681c5",
          "name": null,
          "rpId": "example.com",
          "transports": [],
          "userId": "f84468a3-f383-41ce-83e2-5aab4a712c15",
          "webAuthnCredentialKeyMetaType": "KEY_VAULT",
          "webAuthnCredentialKeyVaultKeyMeta": {
            "createdAt": "1970-01-01T00:00:00.000Z",
            "hsm": false,
            "id": "2721c4a0-1581-49f2-8fcc-8677a84e717d",
            "keyVaultKeyId": "4b45595f5641554c545f4b45595f4944",
            "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
            "updatedAt": "1970-01-01T00:00:00.000Z",
          },
        }
      `);
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .get(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With wrong ID as authenticated user', async () => {
      await request(app.getHttpServer())
        .get(`/api/webauthn-credentials/${WRONG_UUID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('With wrong ID as guest', async () => {
      await request(app.getHttpServer())
        .get(`/api/webauthn-credentials/${WRONG_UUID}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });

  describe('DELETE /api/webauthn-credentials/:id', () => {
    test('As authenticated user', async () => {
      const deleteWebAuthnCredentialResponse = await request(
        app.getHttpServer(),
      )
        .delete(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(deleteWebAuthnCredentialResponse.body).toMatchInlineSnapshot(`
        {
          "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8-Tf52KT82i3pT68spV2unkjceXY",
          "apiKeyId": null,
          "counter": 0,
          "id": "0cc9f49f-2967-404e-b45c-3dc7110681c5",
          "name": null,
          "rpId": "example.com",
          "transports": [],
          "userId": "f84468a3-f383-41ce-83e2-5aab4a712c15",
          "webAuthnCredentialKeyMetaType": "KEY_VAULT",
          "webAuthnCredentialKeyVaultKeyMeta": {
            "createdAt": "1970-01-01T00:00:00.000Z",
            "hsm": false,
            "id": "2721c4a0-1581-49f2-8fcc-8677a84e717d",
            "keyVaultKeyId": "4b45595f5641554c545f4b45595f4944",
            "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
            "updatedAt": "1970-01-01T00:00:00.000Z",
          },
        }
      `);
    });

    test('As guest', async () => {
      await request(app.getHttpServer())
        .delete(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('With wrong ID as authenticated user', async () => {
      await request(app.getHttpServer())
        .delete(`/api/webauthn-credentials/${WRONG_UUID}`)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('With wrong ID as guest', async () => {
      await request(app.getHttpServer())
        .delete(`/api/webauthn-credentials/${WRONG_UUID}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(401);
    });
  });
});
