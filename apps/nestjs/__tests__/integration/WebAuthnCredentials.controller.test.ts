import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  upsertTestingUser,
  upsertTestingWebAuthnCredential,
  WEBAUTHN_CREDENTIAL_ID,
} from '@repo/test-helpers';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { AuthenticatedGuard } from '../../src/guards/Authenticated.guard';
import { PrismaService } from '../../src/services/Prisma.service';
import { MockAuthenticatedGuard } from '../helpers/MockAuthenticatedGuard';
import { MockJwtMiddleware } from '../helpers/MockJwtMiddleware';

describe('WebAuthnCredentialsController', () => {
  let app: INestApplication;
  let item: any;

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
    item = await upsertTestingWebAuthnCredential({ prisma });

    await app.init();
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  test('GET /api/webauthn-credentials as authenticated user', async () => {
    const listWebAuthnCredentialsResponse = await request(app.getHttpServer())
      .get('/api/webauthn-credentials')
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(listWebAuthnCredentialsResponse.body).toMatchInlineSnapshot(`
      [
        {
          "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8+Tf52KT82i3pT68spV2unkjceXY=",
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
            "keyVaultKeyId": "KEY_VAULT_KEY_ID",
            "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
            "updatedAt": "1970-01-01T00:00:00.000Z",
          },
        },
      ]
    `);
  });

  test('GET /api/webauthn-credentials/:id as authenticated user', async () => {
    const getWebAuthnCredentialResponse = await request(app.getHttpServer())
      .get(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(getWebAuthnCredentialResponse.body).toMatchInlineSnapshot(`
      {
        "COSEPublicKey": "pQMmAQIgASFYIOOofxn9iPhgHtwJ8E92uLtm2IDyhReXkPHmeSy7vgz4IlggqNR4i6nXA6JNFkY8+Tf52KT82i3pT68spV2unkjceXY=",
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
          "keyVaultKeyId": "KEY_VAULT_KEY_ID",
          "keyVaultKeyName": "4b45595f5641554c545f4b45595f4e414d45",
          "updatedAt": "1970-01-01T00:00:00.000Z",
        },
      }
    `);
  });

  test('DELETE /api/webauthn-credentials/:id as authenticated user', async () => {
    const deleteWebAuthnCredentialResponse = await request(app.getHttpServer())
      .delete(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(deleteWebAuthnCredentialResponse.body).toMatchInlineSnapshot(`
      {
        "success": true,
      }
    `);
  });
});
