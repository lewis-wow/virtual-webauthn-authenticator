import type { ArrayBufferView_, Uint8Array_ } from '@repo/types';

export const arrayBufferViewToBytes = (
  arrayBufferView: ArrayBufferView_,
): Uint8Array_ => {
  return new Uint8Array(
    arrayBufferView.buffer,
    arrayBufferView.byteOffset,
    arrayBufferView.byteLength,
  );
};
