import { Permission } from '../../src/enums';
import { TokenType } from '../../src/enums/TokenType';
import { JwtPayload } from '../../src/zod-validation/JwtPayloadSchema';

export const USER_ID = 'f84468a3-f383-41ce-83e2-5aab4a712c15';
export const USER_EMAIL = 'john.doe@example.com';
export const USER_NAME = 'John Doe';
export const USER_IMAGE = 'IMAGE';
export const USER_PERMISSIONS = Object.values(Permission);

export const API_KEY_ID = 'f84468a3-f383-41ce-83e2-5aab4a712c16';
export const API_KEY_METADATA = {
  createdWebAuthnCredentialCount: 0,
} as const;

export const USER_JWT_PAYLOAD = {
  userId: USER_ID,
  name: USER_NAME,
  email: USER_EMAIL,
  image: USER_IMAGE,
  permissions: USER_PERMISSIONS,
  apiKeyId: null,

  tokenType: TokenType.USER,
} as const satisfies JwtPayload;

export const API_KEY_JWT_PAYLOAD = {
  ...USER_JWT_PAYLOAD,
  apiKeyId: API_KEY_ID,
  metadata: API_KEY_METADATA,

  tokenType: TokenType.API_KEY,
} as const satisfies JwtPayload;
