// 1. Define BufferSource locally to avoid 'node:' or 'dom' library dependency issues
type BufferSource = ArrayBuffer | ArrayBufferView<ArrayBuffer>;

export class BytesMapper {
  static bytesToBase64(bytes: Uint8Array): string {
    // Optimization: Use Node.js Buffer if available for massive performance boost
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    }

    // Browser fallback
    let binaryString = '';
    const len = bytes.byteLength;
    // Process in chunks to avoid potential stack overflow with spread/apply on massive arrays
    // though standard loop is safe, just slow.
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(bytes[i]!);
    }
    return btoa(binaryString);
  }

  static bytesToBase64URL(bytes: Uint8Array): string {
    const base64 = BytesMapper.bytesToBase64(bytes);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  static base64ToBytes(base64: string): Uint8Array {
    // Optimization: Use Node.js Buffer if available
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(base64, 'base64');
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    }

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  static base64URLToBytes(base64URL: string): Uint8Array {
    const base64 = base64URL.replace(/-/g, '+').replace(/_/g, '/');
    // Note: Node.js 'base64' decoder handles missing padding automatically,
    // but atob() does not. We must restore padding for browser compatibility.
    const padLen = (4 - (base64.length % 4)) % 4;
    const paddedBase64 = base64 + '='.repeat(padLen);

    return BytesMapper.base64ToBytes(paddedBase64);
  }

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
