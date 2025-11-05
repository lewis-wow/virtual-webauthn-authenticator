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
    await upsertTestingWebAuthnCredential({ prisma });

    await app.init();
  });

  afterAll(async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.deleteMany();
    await prisma.webAuthnCredential.deleteMany();
    await prisma.webAuthnCredentialKeyVaultKeyMeta.deleteMany();
    await prisma.jwks.deleteMany();

    await app.close();
  });

  test('GET /api/webauthn-credentials as authenticated user', async () => {
    const listWebAuthnCredentialsResponse = await request(app.getHttpServer())
      .post('/api/webauthn-credentials')
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(listWebAuthnCredentialsResponse).toMatchInlineSnapshot();
  });

  test('GET /api/webauthn-credentials/:id as authenticated user', async () => {
    const getWebAuthnCredentialResponse = await request(app.getHttpServer())
      .get(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(getWebAuthnCredentialResponse).toMatchInlineSnapshot();
  });

  test('DELETE /api/webauthn-credentials/:id as authenticated user', async () => {
    const deleteWebAuthnCredentialResponse = await request(app.getHttpServer())
      .delete(`/api/webauthn-credentials/${WEBAUTHN_CREDENTIAL_ID}`)
      .set('Authorization', `Bearer MOCK_TOKEN`)
      .send()
      .expect('Content-Type', /json/)
      .expect(200);

    expect(deleteWebAuthnCredentialResponse).toMatchInlineSnapshot();
  });
});
