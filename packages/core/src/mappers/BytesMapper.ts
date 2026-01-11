import type { ArrayBufferView_, Uint8Array_ } from '@repo/types';

// Define BufferSource locally to avoid 'node:' or 'dom' library dependency issues
type BufferSource = ArrayBuffer | ArrayBufferView<ArrayBuffer>;

export class BytesMapper {
  static bytesToArrayBuffer(bytes: Uint8Array_): ArrayBuffer {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  }

  static arrayBufferToBytes(arrayBuffer: ArrayBuffer): Uint8Array_ {
    return new Uint8Array(arrayBuffer);
  }

  static arrayBufferViewToBytes(
    arrayBufferView: ArrayBufferView_,
  ): Uint8Array_ {
    return new Uint8Array(
      arrayBufferView.buffer,
      arrayBufferView.byteOffset,
      arrayBufferView.byteLength,
    );
  }

  static bytesToBufferSource(bytes: Uint8Array_): BufferSource {
    return BytesMapper.bytesToArrayBuffer(bytes);
  }

  static bufferSourceToBytes(
    bufferSource: ArrayBuffer | ArrayBufferView_,
  ): Uint8Array_ {
    if (ArrayBuffer.isView(bufferSource)) {
      return BytesMapper.arrayBufferViewToBytes(bufferSource);
    }
    return BytesMapper.arrayBufferToBytes(bufferSource);
  }
}
