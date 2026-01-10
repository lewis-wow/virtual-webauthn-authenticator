import { describe, expect, test } from 'vitest';

import {
  arrayBufferToBytes,
  arrayBufferViewToBytes,
  bufferSourceToBytes,
  bytesToArrayBuffer,
  bytesToBufferSource,
} from '../../../../src/browser/helpers/bytesConversion.js';

describe('bytesConversion', () => {
  describe('arrayBufferToBytes', () => {
    test('should convert ArrayBuffer to Uint8Array', () => {
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer).set([1, 2, 3, 4]);

      const result = arrayBufferToBytes(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);

      const result = arrayBufferToBytes(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(0);
    });

    test('should create a view of the original buffer', () => {
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer).set([1, 2, 3, 4]);

      const result = arrayBufferToBytes(buffer);

      expect(result.buffer).toBe(buffer);
    });
  });

  describe('bytesToArrayBuffer', () => {
    test('should convert Uint8Array to ArrayBuffer', () => {
      const bytes = new Uint8Array([1, 2, 3, 4]);

      const result = bytesToArrayBuffer(bytes);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(Array.from(new Uint8Array(result))).toEqual([1, 2, 3, 4]);
    });

    test('should handle empty Uint8Array', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToArrayBuffer(bytes);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });

    test('should create a new ArrayBuffer (not a view)', () => {
      const bytes = new Uint8Array([1, 2, 3, 4]);

      const result = bytesToArrayBuffer(bytes);

      expect(result).not.toBe(bytes.buffer);
    });

    test('should handle Uint8Array with byteOffset', () => {
      const buffer = new ArrayBuffer(8);
      new Uint8Array(buffer).set([0, 0, 1, 2, 3, 4, 0, 0]);
      const bytes = new Uint8Array(buffer, 2, 4);

      const result = bytesToArrayBuffer(bytes);

      expect(result.byteLength).toBe(4);
      expect(Array.from(new Uint8Array(result))).toEqual([1, 2, 3, 4]);
    });
  });

  describe('arrayBufferViewToBytes', () => {
    test('should convert Uint8Array to Uint8Array', () => {
      const view = new Uint8Array([1, 2, 3, 4]);

      const result = arrayBufferViewToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should convert Uint16Array to Uint8Array', () => {
      const view = new Uint16Array([0x0102, 0x0304]);

      const result = arrayBufferViewToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(4);
    });

    test('should convert Int32Array to Uint8Array', () => {
      const view = new Int32Array([0x01020304]);

      const result = arrayBufferViewToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(4);
    });

    test('should convert DataView to Uint8Array', () => {
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer).set([1, 2, 3, 4]);
      const view = new DataView(buffer);

      const result = arrayBufferViewToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should handle view with byteOffset', () => {
      const buffer = new ArrayBuffer(8);
      new Uint8Array(buffer).set([0, 0, 1, 2, 3, 4, 0, 0]);
      const view = new DataView(buffer, 2, 4);

      const result = arrayBufferViewToBytes(view);

      expect(result.byteLength).toBe(4);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });
  });

  describe('bufferSourceToBytes', () => {
    test('should convert ArrayBuffer to Uint8Array', () => {
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer).set([1, 2, 3, 4]);

      const result = bufferSourceToBytes(buffer);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should convert Uint8Array to Uint8Array', () => {
      const view = new Uint8Array([1, 2, 3, 4]);

      const result = bufferSourceToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should convert DataView to Uint8Array', () => {
      const buffer = new ArrayBuffer(4);
      new Uint8Array(buffer).set([1, 2, 3, 4]);
      const view = new DataView(buffer);

      const result = bufferSourceToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([1, 2, 3, 4]);
    });

    test('should convert Uint32Array to Uint8Array', () => {
      const view = new Uint32Array([0x04030201]);

      const result = bufferSourceToBytes(view);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(4);
    });
  });

  describe('bytesToBufferSource', () => {
    test('should convert Uint8Array to ArrayBuffer', () => {
      const bytes = new Uint8Array([1, 2, 3, 4]);

      const result = bytesToBufferSource(bytes);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(Array.from(new Uint8Array(result as ArrayBuffer))).toEqual([
        1, 2, 3, 4,
      ]);
    });

    test('should handle empty Uint8Array', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToBufferSource(bytes);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect((result as ArrayBuffer).byteLength).toBe(0);
    });
  });

  describe('roundtrip conversions', () => {
    test('should roundtrip ArrayBuffer -> Uint8Array -> ArrayBuffer', () => {
      const original = new ArrayBuffer(4);
      new Uint8Array(original).set([1, 2, 3, 4]);

      const bytes = arrayBufferToBytes(original);
      const result = bytesToArrayBuffer(bytes);

      expect(Array.from(new Uint8Array(result))).toEqual([1, 2, 3, 4]);
    });

    test('should roundtrip Uint8Array -> ArrayBuffer -> Uint8Array', () => {
      const original = new Uint8Array([5, 6, 7, 8]);

      const buffer = bytesToArrayBuffer(original);
      const result = arrayBufferToBytes(buffer);

      expect(Array.from(result)).toEqual([5, 6, 7, 8]);
    });
  });
});
