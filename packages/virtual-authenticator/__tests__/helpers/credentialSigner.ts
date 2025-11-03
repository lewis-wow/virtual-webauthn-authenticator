import { CredentialSigner } from '@repo/types';
import { createSign } from 'node:crypto';

import { keyPair } from './key';

export const credentialSigner: CredentialSigner = {
  sign: (data: Buffer) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return signature;
  },
};
