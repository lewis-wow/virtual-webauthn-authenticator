import type { ArrayBufferView_, Uint8Array_ } from '@repo/types';

/**
 * Converts an ArrayBuffer to a Uint8Array.
 * This is useful when receiving data from browser APIs that return ArrayBuffer
 * and need to work with internal types that use Uint8Array_.
 *
 * @param arrayBuffer - The ArrayBuffer to convert
 * @returns A new Uint8Array view of the ArrayBuffer
 */
export function arrayBufferToBytes(arrayBuffer: ArrayBuffer): Uint8Array_ {
  return new Uint8Array(arrayBuffer);
}

/**
 * Converts a Uint8Array to an ArrayBuffer.
 * This creates a new ArrayBuffer containing only the bytes from the Uint8Array,
 * properly handling byteOffset and byteLength.
 *
 * @param bytes - The Uint8Array to convert
 * @returns A new ArrayBuffer containing the bytes
 */
export function bytesToArrayBuffer(bytes: Uint8Array_): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

/**
 * Converts an ArrayBufferView to a Uint8Array.
 * This handles any typed array or DataView and creates a Uint8Array view.
 *
 * @param view - The ArrayBufferView to convert
 * @returns A new Uint8Array view of the underlying buffer
 */
export function arrayBufferViewToBytes(view: ArrayBufferView_): Uint8Array_ {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

/**
 * Converts a BufferSource (ArrayBuffer or ArrayBufferView) to a Uint8Array.
 * This is the most flexible conversion function, accepting any buffer-like input.
 *
 * @param bufferSource - The BufferSource to convert
 * @returns A new Uint8Array containing the bytes
 */
export function bufferSourceToBytes(
  bufferSource: ArrayBuffer | ArrayBufferView_,
): Uint8Array_ {
  if (ArrayBuffer.isView(bufferSource)) {
    return arrayBufferViewToBytes(bufferSource);
  }
  return arrayBufferToBytes(bufferSource);
}

/**
 * Converts a Uint8Array to a BufferSource (returns ArrayBuffer).
 * This is useful when APIs expect a BufferSource but you have Uint8Array_.
 *
 * @param bytes - The Uint8Array to convert
 * @returns A new ArrayBuffer containing the bytes
 */
export function bytesToBufferSource(
  bytes: Uint8Array_,
): ArrayBuffer | ArrayBufferView_ {
  return bytesToArrayBuffer(bytes);
}
