import type { PublicKeyCredentialRequestOptions } from '../../src/validation/PublicKeyCredentialRequestOptionsSchema';
import { CHALLENGE_BYTES, RP_ID } from './consts';

export const createPublicKeyCredentialRequestOptions = (opts: {
  credentialID: Uint8Array;
}) =>
  ({
    challenge: CHALLENGE_BYTES,
    rpId: RP_ID,
    allowCredentials: [
      {
        id: opts.credentialID,
        type: 'public-key',
      },
    ],
    userVerification: 'required',
  }) as const satisfies PublicKeyCredentialRequestOptions;
