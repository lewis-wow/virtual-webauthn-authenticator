import type { Uint8Array_ } from '@repo/types';

export const bytesToArrayBuffer = (bytes: Uint8Array_): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
};
