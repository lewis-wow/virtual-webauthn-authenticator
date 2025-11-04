import { uuidToBuffer } from '@repo/utils';
import type { JwtPayload } from '@repo/validation';

export const CHALLENGE_BASE64URL = 'YN0gtCsuhL8HedwLHBEqmQ';
export const CHALLENGE_RAW = Buffer.from(CHALLENGE_BASE64URL, 'base64url');

export const USER_ID = '4bdeaf3a-4b6b-4bc0-a9c9-84a3bc996dc4';
export const USER_ID_RAW = uuidToBuffer(USER_ID);
export const USER_EMAIL = 'john.doe@example.com';
export const USER_NAME = 'John Doe';
export const USER_DISPLAY_NAME = USER_NAME;
export const MOCK_JWT_PAYLOAD = {
  id: USER_ID,
  name: USER_NAME,
  email: USER_EMAIL,
} satisfies JwtPayload;

export const RP_ID = 'example.com';
export const RP_NAME = 'example.com';

export const KEY_VAULT_KEY_NAME = 'KEY_VAULT_KEY_NAME';
export const KEY_VAULT_KEY_ID = 'KEY_VAULT_KEY_ID';
