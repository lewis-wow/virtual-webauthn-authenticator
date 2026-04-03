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

const API_PATH = '/api/virtual-authenticators';

describe('VirtualAuthenticatorsController Create - POST /api/virtual-authenticators', () => {
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
        .post(API_PATH)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token is invalid', async () => {
      const token = 'INVALID_TOKEN';

      await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        })
        .expect('Content-Type', /json/)
        .expect(401);
    });

    test('Should not work when token do not have any permission', async () => {
      const token = await jwtIssuer.sign({
        ...USER_JWT_PAYLOAD,
        permissions: [],
      });

      await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        })
        .expect('Content-Type', /json/)
        .expect(403);
    });
  });

  describe('Create with NONE verification type', () => {
    test('Should create a virtual authenticator with NONE verification type', async () => {
      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
        isActive: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Verify created in database
      const virtualAuthenticator = await prisma.virtualAuthenticator.findUnique(
        {
          where: { id: response.body.id },
        },
      );

      expect(virtualAuthenticator).not.toBeNull();
      expect(virtualAuthenticator!.userVerificationType).toBe(
        VirtualAuthenticatorUserVerificationType.NONE,
      );
      expect(virtualAuthenticator!.pin).toBeNull();
      expect(virtualAuthenticator!.isActive).toBe(false);
    });

    test('Should create a virtual authenticator with NONE verification type and ignore pin', async () => {
      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
          pin: '1234',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userVerificationType: VirtualAuthenticatorUserVerificationType.NONE,
      });

      // Pin should not be in the response
      expect(response.body).not.toHaveProperty('pin');
    });
  });

  describe('Create with PIN verification type', () => {
    test('Should create a virtual authenticator with PIN verification type', async () => {
      const response = await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
          pin: '1234',
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
        isActive: false,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });

      // Pin should not be in the response
      expect(response.body).not.toHaveProperty('pin');

      // Verify pin is stored in database
      const virtualAuthenticator = await prisma.virtualAuthenticator.findUnique(
        {
          where: { id: response.body.id },
        },
      );

      expect(virtualAuthenticator).not.toBeNull();
      expect(virtualAuthenticator!.userVerificationType).toBe(
        VirtualAuthenticatorUserVerificationType.PIN,
      );
      expect(virtualAuthenticator!.pin).toBe('1234');
    });

    test('Should fail when PIN verification type is selected but no pin is provided', async () => {
      await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
        })
        .expect(400);
    });

    test('Should fail when PIN verification type is selected but pin is too short', async () => {
      await request(app.getHttpServer())
        .post(API_PATH)
        .set('Authorization', `Bearer ${token}`)
        .send({
          userVerificationType: VirtualAuthenticatorUserVerificationType.PIN,
          pin: '12',
        })
        .expect(400);
    });
  });
});
