// import { root } from '@/routes';
// import { PublicKeyCredentialType } from '@repo/enums';
// import { type User, initializePrismaClient } from '@repo/prisma';
// import { bufferToUuid } from '@repo/utils';
// import { PublicKeyCredentialSchema } from '@repo/validation';
// import {
//   type RegistrationResponseJSON,
//   verifyRegistrationResponse,
// } from '@simplewebauthn/server';
// import { testClient } from 'hono/testing';
// import { describe, test, expect, beforeAll } from 'vitest';
// import z from 'zod';

// import {
//   CHALLENGE_BASE64URL,
//   RP_ID,
//   USER_EMAIL,
//   USER_ID,
//   USER_NAME,
// } from '../../helpers/consts';

// const TEST_USER = {
//   id: USER_ID,
//   email: USER_EMAIL,
//   name: USER_NAME,
// };

// const client = testClient(root, {
//   user: TEST_USER,
// });

// const prisma = initializePrismaClient();

// describe('Credentials POST handler', () => {
//   let user: User;

//   beforeAll(async () => {
//     user = await prisma.user.upsert({
//       where: {
//         id: USER_ID,
//       },
//       update: {},
//       create: TEST_USER,
//     });
//   });

//   test('test', async () => {
//     const response = await client.api.credentials.$post({
//       json: {
//         challenge: CHALLENGE_BASE64URL,
//         rp: {
//           id: RP_ID,
//           name: RP_ID,
//         },
//         pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
//       },
//     });

//     console.log(response);

//     const json = await response.json();

//     console.log(response);

//     expect(response.ok).toBe(true);

//     const decoded = PublicKeyCredentialSchema.decode(json);

//     expect(decoded.type).toBe(PublicKeyCredentialType.PUBLIC_KEY);
//     expect(z.base64url().safeParse(decoded.id).success).toBe(true);
//     expect(z.uuid().safeParse(bufferToUuid(decoded.rawId)).success).toBe(true);

//     await verifyRegistrationResponse({
//       response: json as RegistrationResponseJSON,
//       expectedChallenge: CHALLENGE_BASE64URL,
//       expectedOrigin: RP_ID,
//       expectedRPID: RP_ID,
//       requireUserVerification: true, // Authenticator does perform UV
//       requireUserPresence: false, // Authenticator does NOT perform UP
//     });
//   });
// });
