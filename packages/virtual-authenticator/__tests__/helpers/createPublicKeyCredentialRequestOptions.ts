import { CHALLENGE_RAW, RP_ID } from '@repo/test-helpers';

import type { PublicKeyCredentialRequestOptions } from '../../src/validation/PublicKeyCredentialRequestOptionsSchema';

export const createPublicKeyCredentialRequestOptions = (opts: {
  credentialID: Uint8Array;
}) =>
  ({
    challenge: CHALLENGE_RAW,
    rpId: RP_ID,
    allowCredentials: [
      {
        id: opts.credentialID,
        type: 'public-key',
      },
    ],
    userVerification: 'required',
  }) as const satisfies PublicKeyCredentialRequestOptions;
