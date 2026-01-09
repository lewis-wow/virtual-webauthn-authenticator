import * as cbor from 'cbor2';

import type { COSEPublicKey } from '../COSEPublicKey';

export const decodeCOSEPublicKey = (
  COSEPublicKeyBytes: Uint8Array,
): COSEPublicKey => {
  return cbor.decode<COSEPublicKey>(COSEPublicKeyBytes, { preferMap: true });
};
