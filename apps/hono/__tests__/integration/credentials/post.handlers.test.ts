import { env } from '@/env';
import { root, type Root } from '@/routes';
import { PublicKeyCredentialType } from '@repo/enums';
import { Jwt } from '@repo/jwt';
import { type User, initializePrismaClient } from '@repo/prisma';
import { bufferToUuid } from '@repo/utils';
import { PublicKeyCredentialSchema } from '@repo/validation';
import {
  type RegistrationResponseJSON,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { hc } from 'hono/client';
import { sign } from 'hono/jwt';
import { describe, test, expect, beforeAll } from 'vitest';
import z from 'zod';

import {
  CHALLENGE_BASE64URL,
  RP_ID,
  USER_EMAIL,
  USER_ID,
  USER_NAME,
} from '../../helpers/consts';

const testClient = hc<Root>(`http://localhost:${env.PORT}`, {
  fetch: async (input: string | URL | Request, init?: RequestInit) => {
    const request = new Request(input, init);
    const response = await root.fetch(request);

    return response;
  },
});

const prisma = initializePrismaClient();

const jwt = new Jwt({
  prisma,
  currentKid: env.JWT_CURRENT_JWK_KID,
  encryptionKey: env.JWK_PRIVATE_KEY_ENCRYPTION_SECRET,
  config: {
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  },
});

describe('Credentials POST handler', () => {
  let user: User;

  beforeAll(async () => {
    user = await prisma.user.upsert({
      where: {
        id: USER_ID,
      },
      update: {},
      create: {
        id: USER_ID,
        email: USER_EMAIL,
        name: USER_NAME,
      },
    });
  });

  test('test', async () => {
    const token = await jwt.sign(user);

    const response = await testClient.credentials.$post({
      json: {
        challenge: CHALLENGE_BASE64URL,
        rp: {
          id: RP_ID,
          name: RP_ID,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      },
      // @ts-expect-error - header does not exists in testClient.credentials.$post
      header: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    console.log(response);

    expect(response.ok).toBe(true);

    const decoded = PublicKeyCredentialSchema.decode(json);

    expect(decoded.type).toBe(PublicKeyCredentialType.PUBLIC_KEY);
    expect(z.base64url().safeParse(decoded.id).success).toBe(true);
    expect(z.uuid().safeParse(bufferToUuid(decoded.rawId)).success).toBe(true);

    await verifyRegistrationResponse({
      response: json as RegistrationResponseJSON,
      expectedChallenge: CHALLENGE_BASE64URL,
      expectedOrigin: RP_ID,
      expectedRPID: RP_ID,
      requireUserVerification: true, // Authenticator does perform UV
      requireUserPresence: false, // Authenticator does NOT perform UP
    });
  });
});
