import {
  CHALLENGE_RAW,
  RP_ID,
  RP_NAME,
  USER_DISPLAY_NAME,
  USER_ID_RAW,
  USER_NAME,
} from '@repo/core/__tests__/helpers';

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
} as const satisfies PublicKeyCredentialCreationOptions;
