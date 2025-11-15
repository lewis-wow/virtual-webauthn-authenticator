import type { BufferSource } from 'node:stream/web';
import z from 'zod';

export const BufferSourceBrowserSchema = z.custom<BufferSource>(
  (data) => ArrayBuffer.isView(data) || data instanceof ArrayBuffer,
);

export const decode = (bufferSource: BufferSource): Uint8Array => {
  if (ArrayBuffer.isView(bufferSource)) {
    // If it's already a Uint8Array, you can return it directly or create a copy
    // This creates a new Uint8Array view on the *same* underlying memory segment
    return new Uint8Array(
      bufferSource.buffer,
      bufferSource.byteOffset,
      bufferSource.byteLength,
    );
  }

  // Case 2: If it's an ArrayBuffer
  return new Uint8Array(bufferSource);
};
