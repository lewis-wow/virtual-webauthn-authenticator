import { describe, expect, test } from 'vitest';

import {
  arrayBufferToJson,
  arrayBufferToString,
  bytesToJson,
  bytesToString,
  jsonToArrayBuffer,
  jsonToBytes,
  stringToArrayBuffer,
  stringToBytes,
} from '../../../../src/browser/helpers/stringConversion.js';

describe('stringConversion', () => {
  describe('stringToBytes', () => {
    test('should encode ASCII string to bytes', () => {
      const str = 'Hello';

      const result = stringToBytes(str);

      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([72, 101, 108, 108, 111]);
    });

    test('should handle empty string', () => {
      const result = stringToBytes('');

      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.byteLength).toBe(0);
    });

    test('should encode UTF-8 characters', () => {
      const str = '你好';

      const result = stringToBytes(str);

      expect(result).toBeInstanceOf(Uint8Array);
      // UTF-8 encoding of 你好 is 6 bytes
      expect(result.byteLength).toBe(6);
    });

    test('should encode emoji', () => {
      const str = '😀';

      const result = stringToBytes(str);

      expect(result).toBeInstanceOf(Uint8Array);
      // UTF-8 encoding of emoji is 4 bytes
      expect(result.byteLength).toBe(4);
    });
  });

  describe('bytesToString', () => {
    test('should decode bytes to ASCII string', () => {
      const bytes = new Uint8Array([72, 101, 108, 108, 111]);

      const result = bytesToString(bytes);

      expect(result).toBe('Hello');
    });

    test('should handle empty bytes', () => {
      const bytes = new Uint8Array(0);

      const result = bytesToString(bytes);

      expect(result).toBe('');
    });

    test('should decode UTF-8 bytes', () => {
      // UTF-8 encoding of 你好
      const bytes = new Uint8Array([228, 189, 160, 229, 165, 189]);

      const result = bytesToString(bytes);

      expect(result).toBe('你好');
    });
  });

  describe('stringToArrayBuffer', () => {
    test('should encode string to ArrayBuffer', () => {
      const str = 'Hello';

      const result = stringToArrayBuffer(str);

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(Array.from(new Uint8Array(result))).toEqual([
        72, 101, 108, 108, 111,
      ]);
    });

    test('should handle empty string', () => {
      const result = stringToArrayBuffer('');

      expect(result).toBeInstanceOf(ArrayBuffer);
      expect(result.byteLength).toBe(0);
    });

    test('should create independent ArrayBuffer', () => {
      const str = 'Test';

      const result1 = stringToArrayBuffer(str);
      const result2 = stringToArrayBuffer(str);

      expect(result1).not.toBe(result2);
    });
  });

  describe('arrayBufferToString', () => {
    test('should decode ArrayBuffer to string', () => {
      const buffer = new ArrayBuffer(5);
      new Uint8Array(buffer).set([72, 101, 108, 108, 111]);

      const result = arrayBufferToString(buffer);

      expect(result).toBe('Hello');
    });

    test('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);

      const result = arrayBufferToString(buffer);

      expect(result).toBe('');
    });
  });

  describe('jsonToBytes', () => {
    test('should serialize object to JSON bytes', () => {
      const obj = { type: 'test', value: 123 };

      const result = jsonToBytes(obj);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(bytesToString(result));
      expect(decoded).toEqual(obj);
    });

    test('should serialize array to JSON bytes', () => {
      const arr = [1, 2, 3];

      const result = jsonToBytes(arr);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(bytesToString(result));
      expect(decoded).toEqual(arr);
    });

    test('should serialize string to JSON bytes', () => {
      const str = 'hello';

      const result = jsonToBytes(str);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(bytesToString(result));
      expect(decoded).toBe('hello');
    });

    test('should serialize null to JSON bytes', () => {
      const result = jsonToBytes(null);

      expect(result).toBeInstanceOf(Uint8Array);
      const decoded = JSON.parse(bytesToString(result));
      expect(decoded).toBeNull();
    });
  });

  describe('bytesToJson', () => {
    test('should parse JSON bytes to object', () => {
      const json = '{"type":"test","value":123}';
      const bytes = stringToBytes(json);

      const result = bytesToJson<{ type: string; value: number }>(bytes);

      expect(result).toEqual({ type: 'test', value: 123 });
    });

    test('should parse JSON bytes to array', () => {
      const json = '[1,2,3]';
      const bytes = stringToBytes(json);

      const result = bytesToJson<number[]>(bytes);

      expect(result).toEqual([1, 2, 3]);
    });

    test('should parse JSON bytes to string', () => {
      const json = '"hello"';
      const bytes = stringToBytes(json);

      const result = bytesToJson<string>(bytes);

      expect(result).toBe('hello');
    });
  });

  describe('jsonToArrayBuffer', () => {
    test('should serialize object to JSON ArrayBuffer', () => {
      const obj = { key: 'value' };

      const result = jsonToArrayBuffer(obj);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = JSON.parse(arrayBufferToString(result));
      expect(decoded).toEqual(obj);
    });

    test('should handle nested objects', () => {
      const obj = { outer: { inner: { value: 42 } } };

      const result = jsonToArrayBuffer(obj);

      expect(result).toBeInstanceOf(ArrayBuffer);
      const decoded = JSON.parse(arrayBufferToString(result));
      expect(decoded).toEqual(obj);
    });
  });

  describe('arrayBufferToJson', () => {
    test('should parse JSON ArrayBuffer to object', () => {
      const json = '{"key":"value"}';
      const buffer = stringToArrayBuffer(json);

      const result = arrayBufferToJson<{ key: string }>(buffer);

      expect(result).toEqual({ key: 'value' });
    });

    test('should handle boolean values', () => {
      const json = 'true';
      const buffer = stringToArrayBuffer(json);

      const result = arrayBufferToJson<boolean>(buffer);

      expect(result).toBe(true);
    });

    test('should handle number values', () => {
      const json = '42.5';
      const buffer = stringToArrayBuffer(json);

      const result = arrayBufferToJson<number>(buffer);

      expect(result).toBe(42.5);
    });
  });

  describe('roundtrip conversions', () => {
    test('should roundtrip string -> bytes -> string', () => {
      const original = 'Hello, World! 你好 😀';

      const bytes = stringToBytes(original);
      const result = bytesToString(bytes);

      expect(result).toBe(original);
    });

    test('should roundtrip string -> ArrayBuffer -> string', () => {
      const original = 'Test string with special chars: äöü';

      const buffer = stringToArrayBuffer(original);
      const result = arrayBufferToString(buffer);

      expect(result).toBe(original);
    });

    test('should roundtrip object -> JSON bytes -> object', () => {
      const original = {
        type: 'webauthn.create',
        challenge: 'test-challenge',
        origin: 'https://example.com',
      };

      const bytes = jsonToBytes(original);
      const result = bytesToJson(bytes);

      expect(result).toEqual(original);
    });

    test('should roundtrip object -> JSON ArrayBuffer -> object', () => {
      const original = {
        nested: { array: [1, 2, 3], bool: true },
      };

      const buffer = jsonToArrayBuffer(original);
      const result = arrayBufferToJson(buffer);

      expect(result).toEqual(original);
    });
  });
});
