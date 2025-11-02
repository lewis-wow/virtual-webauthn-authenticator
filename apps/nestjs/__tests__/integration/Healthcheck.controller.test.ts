import { INestApplication, Injectable, NestMiddleware } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { JwtPayload } from '@repo/validation';
import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { describe, test, expect, afterAll, beforeAll } from 'vitest';

import { AppModule } from '../../src/app.module';
import { USER_ID, USER_NAME } from '../helpers/consts';

const mockJwtPayload = {
  id: USER_ID,
  name: USER_NAME,
} satisfies JwtPayload;

@Injectable()
class MockJwtMiddleware implements NestMiddleware {
  async use(req: Request, _res: Response, next: NextFunction) {
    const authorizationHeader = req.headers['authorization'];
    if (authorizationHeader?.includes('Bearer')) {
      req.user = mockJwtPayload;
    } else {
      req.user = null;
    }
    next();
  }
}

describe('HealthcheckController', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const appRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = appRef.createNestApplication();

    const appModule = app.get(AppModule);

    appModule.configure = (consumer) => {
      consumer.apply(MockJwtMiddleware).forRoutes('/api');
    };

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  test('GET /api/healthcheck without user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/healthcheck')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "codec": "2025-11-02T18:22:39.921Z",
        "healthy": true,
        "jwtPayload": null,
      }
    `);
  });

  test('GET /api/healthcheck with user', async () => {
    const mockJwtToken = 'TOKEN';

    const response = await request(app.getHttpServer())
      .get('/api/healthcheck')
      .set('Authorization', `Bearer ${mockJwtToken}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toMatchInlineSnapshot(`
      {
        "codec": "2025-11-02T18:22:39.927Z",
        "healthy": true,
        "jwtPayload": {
          "id": "4bdeaf3a-4b6b-4bc0-a9c9-84a3bc996dc4",
          "name": "John Doe",
        },
      }
    `);
  });
});
