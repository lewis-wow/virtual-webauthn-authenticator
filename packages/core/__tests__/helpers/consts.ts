import { UUIDMapper } from '../../src/mappers';

// https://www.uuidgenerator.net/version4

export const CHALLENGE_BASE64URL = 'YN0gtCsuhL8HedwLHBEqmQ';
export const CHALLENGE_RAW: Uint8Array = Buffer.from(
  CHALLENGE_BASE64URL,
  'base64url',
);

export const USER_ID = 'f84468a3-f383-41ce-83e2-5aab4a712c15';
export const USER_ID_RAW: Uint8Array = UUIDMapper.UUIDtoBytes(USER_ID);
export const USER_EMAIL = 'john.doe@example.com';
export const USER_NAME = 'John Doe';
export const USER_DISPLAY_NAME = USER_NAME;

export const API_KEY_ID = 'f84468a3-f383-41ce-83e2-5aab4a712c16';

export const MOCK_PERSONAL_JWT_PAYLOAD = {
  user: {
    id: USER_ID,
    name: USER_NAME,
    email: USER_EMAIL,
  },
  tokenType: 'PERSONAL',
} as const;

export const MOCK_API_KEY_JWT_PAYLOAD = {
  ...MOCK_PERSONAL_JWT_PAYLOAD,
  apiKey: {
    id: API_KEY_ID,
    enabled: true,
    permissions: {},
    metadata: undefined,
  },
  tokenType: 'API_KEY',
} as const;

export const RP_ID = 'example.com';
export const RP_NAME = 'example.com';
export const RP_ORIGIN = 'https://example.com';

export const KEY_VAULT_KEY_NAME =
  Buffer.from('KEY_VAULT_KEY_NAME').toString('hex');
export const KEY_VAULT_KEY_ID = Buffer.from('KEY_VAULT_KEY_ID').toString('hex');

export const WEBAUTHN_CREDENTIAL_ID = '0cc9f49f-2967-404e-b45c-3dc7110681c5';
export const WEBAUTHN_CREDENTIAL_KEYVAULT_KEY_META_ID =
  '2721c4a0-1581-49f2-8fcc-8677a84e717d';

export const WRONG_UUID = '00000000-0000-0000-0000-000000000000';

export const PUBLIC_KEY_CREDENTIAL_CREATION_OPTIONS = {
  rp: {
    name: RP_NAME,
    id: RP_ID,
  },
  user: {
    id: USER_ID_RAW,
    name: USER_NAME,
    displayName: USER_DISPLAY_NAME,
  },
  challenge: CHALLENGE_RAW,
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  timeout: 60000,
} as const;
