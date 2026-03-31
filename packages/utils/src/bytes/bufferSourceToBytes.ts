import type { BufferSource_, Uint8Array_ } from '@repo/types';

import { arrayBufferToBytes } from './arrayBufferToBytes';
import { arrayBufferViewToBytes } from './arrayBufferViewToBytes';

export const bufferSourceToBytes = (
  bufferSource: BufferSource_,
): Uint8Array_ => {
  if (ArrayBuffer.isView(bufferSource)) {
    return arrayBufferViewToBytes(bufferSource);
  }

  return arrayBufferToBytes(bufferSource);
};
