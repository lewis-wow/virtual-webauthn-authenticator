import * as cbor from '@repo/cbor';
import type { Uint8Array_ } from '@repo/types';

import type { COSEPublicKey } from '../COSEPublicKey';

export const encodeCOSEPublicKey = (
  COSEPublicKey: COSEPublicKey,
): Uint8Array_ => {
  return cbor.encode(COSEPublicKey) as Uint8Array_;
};
