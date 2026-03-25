import { describe, expect, test } from 'vitest';

import {
  arrayBufferToBase64url,
  base64urlToArrayBuffer,
} from '../../../../src/browser/helpers/encodingConversion.js';
import {
  fromBase64,
  fromBase64Url,
  fromHex,
  toBase64,
  toBase64Url,
  toHex,
} from '@repo/utils';

describe('encodingConversion', () => {
  describe('arrayBufferToBase64url', () => {
    test('should encode ArrayBuffer to base64url', () => {
      const buffer = new ArrayBuffer(5);
      new Uint8Array(buffer).set([72, 101, 108, 108, 111]);

      const result = arrayBufferToBase64url(buffer);

      expect(result).toBe('SGVsbG8');
    });

    test('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);

      const result = arrayBufferToBase64url(buffer);

      expect(result).toBe('');
    });
  });

  describe('base64urlToArrayBuffer', () => {
    test('should decode base64url to ArrayBuffer', () => {
      const base64url = 'SGVsbG8';

      const result = base64urlToArrayBuffer(base64url);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(Array.from(new Uint8Array(result))).toEqual([
        72, 101, 108, 108, 111,
      ]);
    });

    test('should handle empty string', () => {
      const result = base64urlToArrayBuffer('');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });
  });

  describe('roundtrip conversions', () => {
    test('should roundtrip bytes -> base64url -> bytes', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253]);

      const encoded = toBase64Url(original);
      const result = fromBase64Url(encoded);

      expect(Array.from(result)).toEqual(Array.from(original));
    });

    test('should roundtrip ArrayBuffer -> base64url -> ArrayBuffer', () => {
      const original = new ArrayBuffer(4);
      new Uint8Array(original).set([10, 20, 30, 40]);

      const encoded = arrayBufferToBase64url(original);
      const result = base64urlToArrayBuffer(encoded);

      expect(Array.from(new Uint8Array(result))).toEqual([10, 20, 30, 40]);
    });

    test('should roundtrip bytes -> base64 -> bytes', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253]);

      const encoded = toBase64(original);
      const result = fromBase64(encoded);

      expect(Array.from(result)).toEqual(Array.from(original));
    });

    test('should roundtrip bytes -> hex -> bytes', () => {
      const original = new Uint8Array([0, 127, 128, 255]);

      const encoded = toHex(original);
      const result = fromHex(encoded);

      expect(Array.from(result)).toEqual(Array.from(original));
    });
  });
});
