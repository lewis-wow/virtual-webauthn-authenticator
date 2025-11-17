import { COSEKeyAlgorithm } from '@repo/enums';
import { createSign } from 'node:crypto';

import { keyPair } from './key';

export const credentialSigner = {
  sign: (data: Uint8Array) => {
    const signature = createSign('sha256')
      .update(data)
      .sign(keyPair.privateKey);

    return { signature, alg: COSEKeyAlgorithm.ES256 };
  },
};
