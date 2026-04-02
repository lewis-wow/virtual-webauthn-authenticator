/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Because app.getHttpServer() has type any
import {
  MockJwtAudience,
  upsertTestingUser,
  USER_JWT_PAYLOAD,
} from '@repo/jwt/__tests__/helpers';

import { KeyClient } from '@azure/keyvault-keys';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtAudience } from '@repo/jwt';
import { VirtualAuthenticatorUserVerificationType } from '@repo/virtual-authenticator/enums';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../../src/app.module';
import { JwtMiddleware } from '../../../src/middlewares/jwt.middleware';
import { PrismaService } from '../../../src/services/Prisma.service';
import { JWT_CONFIG } from '../../helpers/consts';
import { jwtIssuer, getJSONWebKeySet } from '../../helpers/jwt';
import { prisma } from '../../helpers/prisma';

const TEST_VIRTUAL_AUTHENTICATOR_ID_1 = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const TEST_VIRTUAL_AUTHENTICATOR_ID_2 = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
const API_PATH = (id: string) => `/api/virtual-authenticators/${id}`;

const upsertTestingVirtualAuthenticators = async () => {
  const { USER_ID } = await import('@repo/jwt/__tests__/helpers');

  await prisma.virtualAuthenticator.upsert({
    where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_1 },
    update: { isActive: false },
    create: {
      id: TEST_VIRTUAL_AUTHENTICATOR_ID_1,
      userId: USER_ID,
      userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
      isActive: false,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
  });

  await prisma.virtualAuthenticator.upsert({
    where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_2 },
    update: { isActive: false },
    create: {
      id: TEST_VIRTUAL_AUTHENTICATOR_ID_2,
      userId: USER_ID,
      userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
      pin: '1234',
      isActive: false,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
  });
};

const NONEXISTENT_VIRTUAL_AUTHENTICATOR_ID =
  'c3d4e5f6-a7b8-4c9d-ae1f-2a3b4c5d6e7f';

describe('VirtualAuthenticatorsController Update - PUT /api/virtual-authenticators/:id', () => {
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
    await upsertTestingVirtualAuthenticators();

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
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token is invalid', async () => {
      const token = 'INVALID_TOKEN';

      await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token do not have any permission', async () => {
      const token = await jwtIssuer.sign({
        ...USER_JWT_PAYLOAD,
        permissions: [],
      });

      await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('Update', () => {
    test('Should not work when virtual authenticator does not exist', async () => {
      const response = await request(app.getHttpServer())
        .put(API_PATH(NONEXISTENT_VIRTUAL_AUTHENTICATOR_ID))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toMatchInlineSnapshot(`
        {
          "code": "VirtualAuthenticatorNotFound",
          "message": "Virtual Authenticator Not Found.",
        }
      `);
    });

    test('Should set a virtual authenticator as active', async () => {
      const response = await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: TEST_VIRTUAL_AUTHENTICATOR_ID_1,
        userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        isActive: true,
      });

      // Verify in database
      const authenticator = await prisma.virtualAuthenticator.findUnique({
        where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_1 },
      });
      expect(authenticator!.isActive).toBe(true);
    });

    test('Should deactivate other authenticators when setting one as active', async () => {
      // First, set authenticator 1 as active
      await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect(200);

      // Now set authenticator 2 as active
      const response = await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_2))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: TEST_VIRTUAL_AUTHENTICATOR_ID_2,
        userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
        isActive: true,
      });

      // Verify authenticator 1 is now inactive
      const authenticator1 = await prisma.virtualAuthenticator.findUnique({
        where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_1 },
      });
      expect(authenticator1!.isActive).toBe(false);

      // Verify authenticator 2 is active
      const authenticator2 = await prisma.virtualAuthenticator.findUnique({
        where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_2 },
      });
      expect(authenticator2!.isActive).toBe(true);
    });

    test('Should deactivate a virtual authenticator', async () => {
      // First, set authenticator 1 as active
      await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: true })
        .expect(200);

      // Now deactivate it
      const response = await request(app.getHttpServer())
        .put(API_PATH(TEST_VIRTUAL_AUTHENTICATOR_ID_1))
        .set('Authorization', `Bearer ${token}`)
        .send({ isActive: false })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: TEST_VIRTUAL_AUTHENTICATOR_ID_1,
        isActive: false,
      });

      // Verify in database
      const authenticator = await prisma.virtualAuthenticator.findUnique({
        where: { id: TEST_VIRTUAL_AUTHENTICATOR_ID_1 },
      });
      expect(authenticator!.isActive).toBe(false);
    });
  });
});
