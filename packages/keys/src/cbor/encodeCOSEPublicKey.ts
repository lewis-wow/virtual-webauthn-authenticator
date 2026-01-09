import * as cbor from 'cbor2';

import type { COSEPublicKey } from '../COSEPublicKey';

export const encodeCOSEPublicKey = (
  COSEPublicKey: COSEPublicKey,
): Uint8Array => {
  return cbor.encode(COSEPublicKey);
};
