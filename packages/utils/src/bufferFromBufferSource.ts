import { Buffer } from 'buffer';

/**
 * Safely converts any BufferSource into a Node.js Buffer,
 * satisfying the TypeScript compiler.
 *
 * @param data The BufferSource (Buffer, ArrayBuffer, or any ArrayBufferView) to convert.
 * @returns A Node.js Buffer containing the data.
 */
export const bufferFromBufferSource = (data: BufferSource): Buffer => {
  // If it's already a Buffer, do nothing.
  if (data instanceof Buffer) {
    return data;
  }

  // If it's an ArrayBuffer, convert it.
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  // This handles ALL ArrayBufferView types (Uint8Array, DataView, Int16Array, etc.)
  // by creating a Buffer that points to the exact same memory region.
  return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
};
