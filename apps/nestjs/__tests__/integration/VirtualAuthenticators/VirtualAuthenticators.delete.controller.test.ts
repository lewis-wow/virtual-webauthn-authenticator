/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Because app.getHttpServer() has type any
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/auth/__tests__/helpers';
import { WRONG_UUID } from '@repo/test-utils';

import { KeyClient } from '@azure/keyvault-keys';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience } from '@repo/auth';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../../src/app.module';
import { JwtMiddleware } from '../../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../../src/services/Prisma.service';
import { JWT_CONFIG } from '../../helpers/consts';
import { jwtIssuer, getJSONWebKeySet } from '../../helpers/jwt';
import { prisma } from '../../helpers/prisma';

const TEST_VIRTUAL_AUTHENTICATOR_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const API_PATH = `/api/virtual-authenticators/${TEST_VIRTUAL_AUTHENTICATOR_ID}`;

const upsertTestingVirtualAuthenticator = async () => {
  const { USER_ID } = await import('@repo/auth/__tests__/helpers');

  return await prisma.virtualAuthenticator.upsert({
    where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID },
    update: {},
    create: {
      id: TEST_VIRTUAL_AUTHENTICATOR_ID,
      userId: USER_ID,
      userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
  });
};

describe('VirtualAuthenticatorsController Delete - DELETE /api/virtual-authenticators/:id', () => {
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
      .overrideProvider(KeyClient)
      .useValue({ beginDeleteKey: () => ({ pollUntilDone: () => null }) })
      .compile();

    app = appRef.createNestApplication();

    const appModule = app.get(AppModule);
    appModule.configure = (consumer) => {
      consumer.apply(JwtMiddleware).forRoutes('/api');
    };

    await upsertTestingUser({ prisma });
    await upsertTestingVirtualAuthenticator();

    await app.init();
  });

  afterAll(async () => {
    await prisma.virtualAuthenticator.deleteMany();
    await prisma.user.deleteMany();
    await prisma.jwks.deleteMany();

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
        .expect(404);

      expect(response.body).toMatchInlineSnapshot(`
        {
          "code": "VirtualAuthenticatorNotFound",
          "message": "Virtual Authenticator Not Found.",
        }
      `);
    });

    test('Should work as authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .delete(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send()
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchInlineSnapshot(`
        {
          "createdAt": "1970-01-01T00:00:00.000Z",
          "id": "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
          "isActive": false,
          "updatedAt": "1970-01-01T00:00:00.000Z",
          "userVerificationType": "NONE",
        }
      `);

      const virtualAuthenticator = await prisma.virtualAuthenticator.findUnique(
        {
          where: {
            id: TEST_VIRTUAL_AUTHENTICATOR_ID,
          },
        },
      );

      expect(virtualAuthenticator).toBe(null);
    });
  });
});
