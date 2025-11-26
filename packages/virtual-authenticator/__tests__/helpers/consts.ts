import { USER_ID, USER_NAME } from '@repo/auth/__tests__/helpers';

import { UUIDMapper } from '@repo/core/mappers';

import type { PublicKeyCredentialCreationOptions } from '../../src/zod-validation/PublicKeyCredentialCreationOptionsSchema';

export const CHALLENGE_BASE64URL = 'YN0gtCsuhL8HedwLHBEqmQ';
export const CHALLENGE_BYTES = new Uint8Array(
  Buffer.from(CHALLENGE_BASE64URL, 'base64url'),
);
export const USER_DISPLAY_NAME = USER_NAME;
export const USER_ID_BYTSES = UUIDMapper.UUIDtoBytes(USER_ID);

export const RP_ID = 'example.com';
export const RP_NAME = 'example.com';
export const RP_ORIGIN = 'https://example.com';

export const PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS = {
  rp: {
    name: RP_NAME,
    id: RP_ID,
  },
  user: {
    id: USER_ID_BYTSES,
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
  },
  challenge: CHALLENGE_BYTES,
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  timeout: 60000,
} as const satisfies PublicKeyCredentialCreationOptions;
