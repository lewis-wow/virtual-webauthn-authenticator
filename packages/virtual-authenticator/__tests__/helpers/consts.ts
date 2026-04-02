import { USER_ID, USER_NAME } from '../../../jwt/__tests__/helpers';

import { COSEKeyAlgorithm } from '@repo/keys/enums';
import { uuidToBytes } from '@repo/utils';

import { PublicKeyCredentialType } from '../../src/enums/PublicKeyCredentialType';
import type { PublicKeyCredentialCreationOptions } from '../../src/validation/spec/PublicKeyCredentialCreationOptionsSchema';

export const CHALLENGE_BASE64URL = 'YN0gtCsuhL8HedwLHBEqmQ';
export const CHALLENGE_BYTES = new Uint8Array(
  Buffer.from(CHALLENGE_BASE64URL, 'base64url'),
);
export const USER_DISPLAY_NAME = USER_NAME;
export const USER_ID_BYTSES = uuidToBytes(USER_ID);

export const RP_ID = 'example.com';
export const RP_NAME = 'example.com';
export const RP_ORIGIN = 'https://example.com';

export const VIRTUAL_AUTHENTICATOR_ID = '00000000-0000-0000-0000-000000000001';
export const TEST_PIN = '1234';

export const WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_ID =
  '0cc9f49f-2967-404e-b45c-3dc7110681c5';
export const WEB_AUTHN_PUBLIC_KEY_CREDENTIAL_KEYVAULT_KEY_META_ID =
  '2721c4a0-1581-49f2-8fcc-8677a84e717d';

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
  pubKeyCredParams: [
    { type: PublicKeyCredentialType.PUBLIC_KEY, alg: COSEKeyAlgorithm.ES256 },
  ],
  timeout: 60000,
} as PublicKeyCredentialCreationOptions;
