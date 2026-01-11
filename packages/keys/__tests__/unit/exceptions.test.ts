import { HttpStatusCode } from '@repo/http';
import { describe, expect, test } from 'vitest';

import { UnsupportedKeyType } from '../../src/exceptions/UnsupportedKeyType.js';

describe('Exceptions', () => {
  describe('UnsupportedKeyType', () => {
    test('should have correct status code', () => {
      expect(UnsupportedKeyType.status).toBe(HttpStatusCode.BAD_REQUEST_400);
    });

    test('should have correct error code', () => {
      expect(UnsupportedKeyType.code).toBe('UnsupportedKeyType');
    });

    test('should have correct error message', () => {
      expect(UnsupportedKeyType.message).toBe('Unsupported key type.');
    });

    test('should be throwable', () => {
      expect(() => {
        throw new UnsupportedKeyType();
      }).toThrow(UnsupportedKeyType);
    });

    test('should be catchable as Error', () => {
      try {
        throw new UnsupportedKeyType();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});
