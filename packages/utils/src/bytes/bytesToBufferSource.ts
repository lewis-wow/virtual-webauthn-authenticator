import type { BufferSource_, Uint8Array_ } from '@repo/types';

import { bytesToArrayBuffer } from './bytesToArrayBuffer';

export const bytesToBufferSource = (bytes: Uint8Array_): BufferSource_ => {
  return bytesToArrayBuffer(bytes);
};
