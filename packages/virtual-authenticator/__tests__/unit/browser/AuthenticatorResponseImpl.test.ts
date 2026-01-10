import { describe, expect, test } from 'vitest';

import { AuthenticatorResponseImpl } from '../../../src/browser/AuthenticatorResponseImpl.js';

describe('AuthenticatorResponseImpl', () => {
  describe('constructor', () => {
    test('should create instance with clientDataJSON', () => {
      const clientDataJSON = new ArrayBuffer(32);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON).toBe(clientDataJSON);
    });

    test('should store clientDataJSON as readonly property', () => {
      const clientDataJSON = new ArrayBuffer(16);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON).toBeInstanceOf(ArrayBuffer);
      expect(response.clientDataJSON.byteLength).toBe(16);
    });

    test('should handle empty ArrayBuffer', () => {
      const clientDataJSON = new ArrayBuffer(0);

      const response = new AuthenticatorResponseImpl({ clientDataJSON });

      expect(response.clientDataJSON.byteLength).toBe(0);
    });
  });
});
