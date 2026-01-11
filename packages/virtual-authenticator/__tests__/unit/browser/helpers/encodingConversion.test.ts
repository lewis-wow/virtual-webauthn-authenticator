import { describe, expect, test } from 'vitest';

import {
  arrayBufferToBase64url,
  base64ToBytes,
  base64urlToArrayBuffer,
  base64urlToBytes,
  bytesToBase64,
  bytesToBase64url,
  bytesToHex,
  hexToBytes,
} from '../../../../src/browser/helpers/encodingConversion.js';

describe('encodingConversion', () => {
  describe('bytesToBase64url', () => {
    test('should encode bytes to base64url', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"

      const result = bytesToBase64url(bytes);

      expect(result).toBe('SGVsbG8');
    });

    test('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToBase64url(bytes);

      expect(result).toBe('');
    });

    test('should produce URL-safe output (no + or /)', () => {
      // Bytes that would produce + and / in standard base64
      const bytes = new Uint8Array([251, 255, 254]);

      const result = bytesToBase64url(bytes);

      expect(result).not.toContain('+');
      expect(result).not.toContain('/');
      expect(result).toBe('-__-');
    });

    test('should not include padding', () => {
      const bytes = new Uint8Array([1]);

      const result = bytesToBase64url(bytes);

      expect(result).not.toContain('=');
      expect(result).toBe('AQ');
    });
  });

  describe('base64urlToBytes', () => {
    test('should decode base64url to bytes', () => {
      const base64url = 'SGVsbG8';

      const result = base64urlToBytes(base64url);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
    });

    test('should handle empty string', () => {
      const result = base64urlToBytes('');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(0);
    });

    test('should handle URL-safe characters', () => {
      const base64url = '-__-';

      const result = base64urlToBytes(base64url);

      expect(Array.from(result)).toEqual([251, 255, 254]);
    });

    test('should handle input without padding', () => {
      const base64url = 'AQ';

      const result = base64urlToBytes(base64url);

      expect(Array.from(result)).toEqual([1]);
    });
  });

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

  describe('bytesToBase64', () => {
    test('should encode bytes to standard base64', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);

      const result = bytesToBase64(bytes);

      expect(result).toBe('SGVsbG8=');
    });

    test('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToBase64(bytes);

      expect(result).toBe('');
    });

    test('should include padding', () => {
      const bytes = new Uint8Array([1]);

      const result = bytesToBase64(bytes);

      expect(result).toBe('AQ==');
    });

    test('should use standard base64 characters (+ and /)', () => {
      const bytes = new Uint8Array([251, 255, 254]);

      const result = bytesToBase64(bytes);

      expect(result).toBe('+//+');
    });
  });

  describe('base64ToBytes', () => {
    test('should decode standard base64 to bytes', () => {
      const base64 = 'SGVsbG8=';

      const result = base64ToBytes(base64);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
    });

    test('should handle empty string', () => {
      const result = base64ToBytes('');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(0);
    });

    test('should handle standard base64 characters', () => {
      const base64 = '+//+';

      const result = base64ToBytes(base64);

      expect(Array.from(result)).toEqual([251, 255, 254]);
    });
  });

  describe('bytesToHex', () => {
    test('should encode bytes to hex string', () => {
      const bytes = new Uint8Array([0, 1, 15, 16, 255]);

      const result = bytesToHex(bytes);

      expect(result).toBe('00010f10ff');
    });

    test('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToHex(bytes);

      expect(result).toBe('');
    });

    test('should produce lowercase hex', () => {
      const bytes = new Uint8Array([171, 205, 239]);

      const result = bytesToHex(bytes);

      expect(result).toBe('abcdef');
    });
  });

  describe('hexToBytes', () => {
    test('should decode hex string to bytes', () => {
      const hex = '00010f10ff';

      const result = hexToBytes(hex);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([0, 1, 15, 16, 255]);
    });

    test('should handle empty string', () => {
      const result = hexToBytes('');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(0);
    });

    test('should handle lowercase hex', () => {
      const hex = 'abcdef';

      const result = hexToBytes(hex);

      expect(Array.from(result)).toEqual([171, 205, 239]);
    });

    test('should handle uppercase hex', () => {
      const hex = 'ABCDEF';

      const result = hexToBytes(hex);

      expect(Array.from(result)).toEqual([171, 205, 239]);
    });
  });

  describe('roundtrip conversions', () => {
    test('should roundtrip bytes -> base64url -> bytes', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253]);

      const encoded = bytesToBase64url(original);
      const result = base64urlToBytes(encoded);

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

      const encoded = bytesToBase64(original);
      const result = base64ToBytes(encoded);

      expect(Array.from(result)).toEqual(Array.from(original));
    });

    test('should roundtrip bytes -> hex -> bytes', () => {
      const original = new Uint8Array([0, 127, 128, 255]);

      const encoded = bytesToHex(original);
      const result = hexToBytes(encoded);

      expect(Array.from(result)).toEqual(Array.from(original));
    });
  });
});
