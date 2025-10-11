import type { BufferLike } from '@repo/types';
import { Buffer } from 'buffer';

/**
 * Safely converts any BufferSource into a Node.js Buffer,
 * satisfying the TypeScript compiler.
 *
 * @param data The BufferSource (Buffer, ArrayBuffer, or any ArrayBufferView) to convert.
 * @returns A Node.js Buffer containing the data.
 */
export const toBuffer = (
  data: BufferLike,
  encoding?: BufferEncoding,
): Buffer => {
  if (data instanceof Buffer) {
    return data;
  }

  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }

  if (typeof data === 'string') {
    return Buffer.from(data, encoding);
  }

  return Buffer.from(
    data.buffer,
    data.byteOffset,
    data.byteLength,
  ) as Buffer<ArrayBuffer>;
};
