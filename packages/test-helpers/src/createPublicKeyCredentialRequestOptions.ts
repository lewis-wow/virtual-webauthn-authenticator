import type { PublicKeyCredentialRequestOptions } from '@repo/validation';

import { CHALLENGE_RAW, RP_ID } from './consts';

export const createPublicKeyCredentialRequestOptions = (opts: {
  credentialID: Buffer;
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
