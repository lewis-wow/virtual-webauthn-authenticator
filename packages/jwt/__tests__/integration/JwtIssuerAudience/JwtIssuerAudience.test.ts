import { Jwks, Jwt, JwtClaimValidationFailedException } from '@repo/crypto';
import { PrismaAuthJwksRepository } from '@repo/jwks';
import { PrismaClient } from '@repo/prisma';
import { createServer, type Server } from 'node:http';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { JwtAudience } from '../../../src/JwtAudience';
import { JwtIssuer } from '../../../src/JwtIssuer';
import {
  API_KEY_ID,
  API_KEY_JWT_PAYLOAD,
  USER_ID,
  USER_JWT_PAYLOAD,
} from '../../helpers/consts';
import { upsertTestingUser } from '../../helpers/upsertTestingUser';

describe('JwtIssuer + JwtAudience integration', () => {
  const prisma = new PrismaClient();
  const startedAt = new Date();
  const jwks = new Jwks({
    encryptionKey: 'jwt-integration-test-encryption-key',
    jwksRepository: new PrismaAuthJwksRepository({ prisma }),
  });
  const jwt = new Jwt({ jwks });

  const config = {
    iss: 'https://auth.integration.test',
    aud: 'virtual-webauthn-app',
  } as const;

  const jwtIssuer = new JwtIssuer({
    jwt,
    config,
  });

  let server: Server;
  let authServerBaseURL: string;

  beforeAll(async () => {
    await upsertTestingUser({ prisma });

    server = createServer(async (req, res) => {
      if (req.url !== '/.well-known/jwks.json') {
        res.statusCode = 404;
        res.end('Not Found');

        return;
      }

      const jsonWebKeySet = await jwks.getJSONWebKeySet();

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(jsonWebKeySet));
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        resolve();
      });
    });

    const address = server.address();

    if (address === null || typeof address === 'string') {
      throw new Error('Failed to bind integration JWKS server');
    }

    authServerBaseURL = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    if (server !== undefined && server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });
    }

    await prisma.jwks.deleteMany({
      where: {
        label: PrismaAuthJwksRepository.DATABASE_LABEL,
        createdAt: {
          gte: startedAt,
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        id: USER_ID,
      },
    });

    await prisma.$disconnect();
  });

  test('signs and validates user token end-to-end with remote JWKS', async () => {
    const token = await jwtIssuer.sign(USER_JWT_PAYLOAD);
    const jwtAudience = new JwtAudience({
      authServerBaseURL,
      config,
    });

    const payload = await jwtAudience.validateToken(token);

    expect(payload.userId).toBe(USER_JWT_PAYLOAD.userId);
    expect(payload.apiKeyId).toBeNull();
    expect(payload.sub).toBe(USER_JWT_PAYLOAD.userId);
    expect(payload.iss).toBe(config.iss);
    expect(payload.aud).toBe(config.aud);
  });

  test('signs and validates api-key token with api key subject', async () => {
    const token = await jwtIssuer.sign(API_KEY_JWT_PAYLOAD);
    const jwtAudience = new JwtAudience({
      authServerBaseURL,
      config,
    });

    const payload = await jwtAudience.validateToken(token);

    expect(payload.tokenType).toBe(API_KEY_JWT_PAYLOAD.tokenType);
    if (payload.tokenType !== API_KEY_JWT_PAYLOAD.tokenType) {
      return;
    }

    expect(payload.apiKeyId).toBe(API_KEY_ID);
    expect(payload.sub).toBe(API_KEY_ID);
    expect(payload.metadata.createdWebAuthnPublicKeyCredentialCount).toBe(
      API_KEY_JWT_PAYLOAD.metadata.createdWebAuthnPublicKeyCredentialCount,
    );
  });

  test('fails validation when configured audience does not match token aud', async () => {
    const token = await jwtIssuer.sign(USER_JWT_PAYLOAD);
    const jwtAudience = new JwtAudience({
      authServerBaseURL,
      config: {
        ...config,
        aud: 'different-audience',
      },
    });

    await expect(jwtAudience.validateToken(token)).rejects.toBeInstanceOf(
      JwtClaimValidationFailedException,
    );
  });
});
