import { describe, expect, test } from 'vitest';

import { AuthenticatorResponseImpl } from '../../../src/browser/AuthenticatorResponseImpl.js';

describe('AuthenticatorResponseImpl', () => {
  describe('constructor', () => {
    test('should create instance with clientDataJSON', () => {
      const clientDataJSON = new Uint8Array(32);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.clientDataJSON.byteLength).toBe(32);
    });

    test('should store clientDataJSON as readonly property', () => {
      const clientDataJSON = new Uint8Array(16);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.clientDataJSON.byteLength).toBe(16);
    });

    test('should handle empty Uint8Array', () => {
      const clientDataJSON = new Uint8Array(0);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON.byteLength).toBe(0);
    });

    test('should convert Uint8Array to ArrayBuffer', () => {
      const clientDataJSON = new Uint8Array([1, 2, 3, 4]);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(new Uint8Array(response.clientDataJSON)).toEqual(clientDataJSON);
    });
  });
});
