import type { BufferSource } from 'node:stream/web';

export class BytesTransformer {
  static toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  }

  static fromArrayBuffer(arrayBuffer: ArrayBuffer): Uint8Array {
    return new Uint8Array(arrayBuffer);
  }

  static toArrayBufferView(bytes: Uint8Array): ArrayBufferView {
    return bytes;
  }

  static fromArrayBufferView(arrayBufferView: ArrayBufferView): Uint8Array {
    return new Uint8Array(
      arrayBufferView.buffer,
      arrayBufferView.byteOffset,
      arrayBufferView.byteLength,
    );
  }

  static toBufferSource(bytes: Uint8Array): BufferSource {
    return bytes;
  }

  static fromBufferSource(bufferSource: BufferSource): Uint8Array {
    if (ArrayBuffer.isView(bufferSource)) {
      // If it's already a Uint8Array, you can return it directly or create a copy
      // This creates a new Uint8Array view on the *same* underlying memory segment
      return BytesTransformer.fromArrayBufferView(bufferSource);
    }

    // Case 2: If it's an ArrayBuffer
    return BytesTransformer.fromArrayBuffer(bufferSource);
  }
}
