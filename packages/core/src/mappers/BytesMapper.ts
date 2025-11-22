// Define BufferSource locally to avoid 'node:' or 'dom' library dependency issues
type BufferSource = ArrayBuffer | ArrayBufferView<ArrayBuffer>;

export class BytesMapper {
  static bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  }

  static arrayBufferToBytes(arrayBuffer: ArrayBuffer): Uint8Array {
    return new Uint8Array(arrayBuffer);
  }

  static arrayBufferViewToBytes(arrayBufferView: ArrayBufferView): Uint8Array {
    return new Uint8Array(
      arrayBufferView.buffer,
      arrayBufferView.byteOffset,
      arrayBufferView.byteLength,
    );
  }

  static bytesToBufferSource(bytes: Uint8Array): BufferSource {
    return BytesMapper.bytesToArrayBuffer(bytes);
  }

  static bufferSourceToBytes(
    bufferSource: BufferSource | ArrayBufferView<SharedArrayBuffer>,
  ): Uint8Array {
    if (ArrayBuffer.isView(bufferSource)) {
      return BytesMapper.arrayBufferViewToBytes(bufferSource);
    }
    return BytesMapper.arrayBufferToBytes(bufferSource);
  }
}
