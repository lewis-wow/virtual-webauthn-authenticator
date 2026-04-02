import type { ArrayBufferView_, Uint8Array_ } from '@repo/types';

export function arrayBufferToBytes(arrayBuffer: ArrayBuffer): Uint8Array_ {
  return new Uint8Array(arrayBuffer);
}

export function bytesToArrayBuffer(bytes: Uint8Array_): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

export function arrayBufferViewToBytes(view: ArrayBufferView_): Uint8Array_ {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

export function bufferSourceToBytes(
  bufferSource: ArrayBuffer | ArrayBufferView_,
): Uint8Array_ {
  if (ArrayBuffer.isView(bufferSource)) {
    return arrayBufferViewToBytes(bufferSource);
  }
  return arrayBufferToBytes(bufferSource);
}

export function bytesToBufferSource(
  bytes: Uint8Array_,
): ArrayBuffer | ArrayBufferView_ {
  return bytesToArrayBuffer(bytes);
}
