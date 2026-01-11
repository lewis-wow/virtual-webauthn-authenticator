import * as cbor from '@repo/cbor';
import type { Uint8Array_ } from '@repo/types';

import type { COSEPublicKey } from '../COSEPublicKey';

export const decodeCOSEPublicKey = (
  COSEPublicKeyBytes: Uint8Array_,
): COSEPublicKey => {
  return cbor.decode<COSEPublicKey>(COSEPublicKeyBytes);
};
