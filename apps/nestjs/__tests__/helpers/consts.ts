import type { JwtPayload } from '@repo/validation';

export const CHALLENGE_BASE64URL = 'YN0gtCsuhL8HedwLHBEqmQ';

export const USER_ID = '4bdeaf3a-4b6b-4bc0-a9c9-84a3bc996dc4';
export const USER_EMAIL = 'john.doe@example.com';
export const USER_NAME = 'John Doe';

export const RP_ID = 'example.com';

export const MOCK_JWT_PAYLOAD = {
  id: USER_ID,
  name: USER_NAME,
} satisfies JwtPayload;
